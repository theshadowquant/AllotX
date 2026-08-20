import { RegistrarAdapter } from './RegistrarAdapter';
import { AllotmentResult, CheckAllotmentParams } from './types';

export class MockRegistrarAdapter extends RegistrarAdapter {
  readonly code = 'MOCK';
  readonly name = 'Mock Registrar Engine';
  readonly officialUrl = 'https://allotx-mock.internal';

  async checkAllotment(params: CheckAllotmentParams): Promise<AllotmentResult> {
    const { pan } = params;
    const cleanPan = pan.trim().toUpperCase();

    // Deterministic simulation based on PAN character code or pattern for consistent testing:
    // - PAN ending with 'A' or 'B' or '1' -> ALLOTTED
    // - PAN ending with 'C' or 'E' or 'ERR' -> ERROR
    // - PAN ending with 'Z' -> CAPTCHA_REQUIRED (when no verificationContext provided)
    // - Others -> NOT_ALLOTTED

    await new Promise((resolve) => setTimeout(resolve, 600)); // Simulate realistic network delay

    const lastChar = cleanPan.slice(-1);
    const checkedAt = new Date().toISOString();

    if (params.verificationContext && params.verificationContext.verificationState === 'VERIFIED') {
      return {
        status: 'ALLOTTED',
        sharesAllotted: 17,
        lotsAllotted: 1,
        applicationNumber: `APP-${Math.floor(100000 + Math.random() * 900000)}`,
        checkedAt,
        source: 'MOCK',
        officialUrl: this.officialUrl,
        message: 'Verified successfully via Mock Registrar Enquiry',
      };
    }

    if (lastChar === 'Z' && !params.verificationContext) {
      return {
        status: 'CAPTCHA_REQUIRED',
        sharesAllotted: 0,
        lotsAllotted: 0,
        checkedAt,
        source: 'MOCK',
        officialUrl: this.officialUrl,
        message: 'Verification code required to query registrar enquiry system.',
      };
    }

    if (lastChar === 'E') {
      return {
        status: 'ERROR',
        sharesAllotted: 0,
        lotsAllotted: 0,
        checkedAt,
        source: 'MOCK',
        officialUrl: this.officialUrl,
        errorCode: 'REGISTRAR_BUSY',
        message: 'Mock Registrar server temporarily under high traffic load. Please retry.',
      };
    }

    // Determine allotment based on PAN
    if (['A', 'B', '1', '3', '7'].includes(lastChar)) {
      return {
        status: 'ALLOTTED',
        sharesAllotted: 17,
        lotsAllotted: 1,
        applicationNumber: `APP-${Math.floor(100000 + Math.random() * 900000)}`,
        checkedAt,
        source: 'MOCK',
        officialUrl: this.officialUrl,
        message: 'Congratulations! 17 Shares (1 Lot) allotted.',
      };
    }

    return {
      status: 'NOT_ALLOTTED',
      sharesAllotted: 0,
      lotsAllotted: 0,
      checkedAt,
      source: 'MOCK',
      officialUrl: this.officialUrl,
      message: 'No allotment found for this PAN.',
    };
  }
}
