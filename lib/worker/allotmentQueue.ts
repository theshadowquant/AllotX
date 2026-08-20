import { db } from '@/lib/db';
import { decryptPAN } from '@/lib/crypto';
import { RegistrarFactory } from '@/lib/registrars/RegistrarFactory';
import { AllotmentResult } from '@/lib/registrars/types';

interface QueueTask {
  applicantId: string;
  groupId: string;
  ipoId: string;
  ipoName: string;
  ipoSymbol: string;
  panEncrypted: string;
  registrarCode: string;
}

class AllotmentQueue {
  private queue: QueueTask[] = [];
  private isProcessing = false;
  private concurrencyLimit = 3;

  /**
   * Adds tasks to the queue and triggers processing.
   */
  async addGroupTasks(tasks: QueueTask[]): Promise<void> {
    this.queue.push(...tasks);
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  /**
   * Processes single applicant allotment check directly. Writes to DB and AllotmentCheck history.
   */
  async processApplicantCheck(task: QueueTask): Promise<AllotmentResult> {
    const startTime = Date.now();
    let panDecrypted = '';

    try {
      panDecrypted = decryptPAN(task.panEncrypted);
    } catch (err: any) {
      const errorResult: AllotmentResult = {
        status: 'ERROR',
        sharesAllotted: 0,
        lotsAllotted: 0,
        checkedAt: new Date().toISOString(),
        source: task.registrarCode,
        errorCode: 'DECRYPTION_FAILED',
        message: 'Failed to decrypt sensitive applicant data.',
      };

      await this.saveCheckResult(task, errorResult, Date.now() - startTime);
      return errorResult;
    }

    try {
      const adapter = RegistrarFactory.getAdapter(task.registrarCode);
      const result = await adapter.checkAllotment({
        ipoName: task.ipoName,
        ipoSymbol: task.ipoSymbol,
        pan: panDecrypted,
      });

      const durationMs = Date.now() - startTime;
      await this.saveCheckResult(task, result, durationMs);
      return result;
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      const errorResult: AllotmentResult = {
        status: 'ERROR',
        sharesAllotted: 0,
        lotsAllotted: 0,
        checkedAt: new Date().toISOString(),
        source: task.registrarCode,
        errorCode: 'ADAPTER_FAILURE',
        message: err.message || 'Registrar check failed unexpectedly.',
      };

      await this.saveCheckResult(task, errorResult, durationMs);
      return errorResult;
    }
  }

  private async saveCheckResult(task: QueueTask, result: AllotmentResult, durationMs: number) {
    const checkedAt = new Date();

    // 1. Update applicant current status
    await db.applicant.update({
      where: { id: task.applicantId },
      data: {
        status: result.status as any,
        sharesAllotted: result.sharesAllotted,
        lotsAllotted: result.lotsAllotted,
        applicationNumber: result.applicationNumber || null,
        verificationSource: result.source,
        lastCheckedAt: checkedAt,
        lastErrorMessage: result.message || null,
      },
    });

    // 2. Audit Trail: Insert record into AllotmentCheck history table
    await db.allotmentCheck.create({
      data: {
        applicantId: task.applicantId,
        ipoId: task.ipoId,
        registrarCode: result.source || task.registrarCode,
        status: result.status as any,
        sharesAllotted: result.sharesAllotted,
        lotsAllotted: result.lotsAllotted,
        durationMs,
        errorCode: result.errorCode || null,
        message: result.message || null,
        checkedAt,
      },
    });
  }

  private async processQueue(): Promise<void> {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const batch = this.queue.splice(0, this.concurrencyLimit);

    await Promise.all(
      batch.map(async (task) => {
        try {
          await this.processApplicantCheck(task);
        } catch (e) {
          console.error(`Queue item failed for applicant ${task.applicantId}:`, e);
        }
      })
    );

    // Yield back to event loop with backoff before processing next batch
    setTimeout(() => this.processQueue(), 200);
  }
}

export const allotmentQueueWorker = new AllotmentQueue();
