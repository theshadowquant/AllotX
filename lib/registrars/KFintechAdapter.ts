import { RegistrarAdapter } from './RegistrarAdapter';
import { AllotmentResult, CheckAllotmentParams } from './types';

export class KFintechAdapter extends RegistrarAdapter {
  readonly code = 'KFINTECH';
  readonly name = 'KFin Technologies';
  readonly officialUrl = 'https://ris.kfintech.com/ipostatus/';

  async checkAllotment(params: CheckAllotmentParams): Promise<AllotmentResult> {
    const { pan, ipoName } = params;
    const checkedAt = new Date().toISOString();

    try {
      // In production environment with live endpoints:
      // KFintech public allotment portal uses endpoint: https://ris.kfintech.com/ipostatus/Services/ipostatus.asmx/GetApplicationStatus
      // Or requires session token / CAPTCHA verification when rate limited.

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      // Attempt public check if available, or request verification context
      const isMockMode = process.env.DATA_PROVIDER === 'mock';

      if (isMockMode) {
        // Controlled mock behavior for KFintech test suite
        await new Promise((resolve) => setTimeout(resolve, 500));
        const lastDigit = pan.slice(-1);
        if (['B', '8', '9'].includes(lastDigit)) {
          return {
            status: 'ALLOTTED',
            sharesAllotted: 30,
            lotsAllotted: 2,
            applicationNumber: `KF-${Math.floor(100000 + Math.random() * 900000)}`,
            checkedAt,
            source: 'KFINTECH',
            officialUrl: this.officialUrl,
            message: 'Allotted 30 shares (2 Lots) via KFintech Enquiry',
          };
        }
        if (lastDigit === 'Z' && !params.verificationContext) {
          return {
            status: 'CAPTCHA_REQUIRED',
            sharesAllotted: 0,
            lotsAllotted: 0,
            checkedAt,
            source: 'KFINTECH',
            officialUrl: this.officialUrl,
            message: 'KFintech requires CAPTCHA verification.',
          };
        }
        return {
          status: 'NOT_ALLOTTED',
          sharesAllotted: 0,
          lotsAllotted: 0,
          checkedAt,
          source: 'KFINTECH',
          officialUrl: this.officialUrl,
          message: 'Non-allotted as per KFintech record.',
        };
      }

      // Live portal fetch simulation/integration
      const response = await fetch('https://ris.kfintech.com/ipostatus/', {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml',
        },
        signal: controller.signal,
      }).catch(() => null);

      clearTimeout(timeoutId);

      if (!response || !response.ok) {
        return {
          status: 'TEMPORARILY_UNAVAILABLE',
          sharesAllotted: 0,
          lotsAllotted: 0,
          checkedAt,
          source: 'KFINTECH',
          officialUrl: this.officialUrl,
          errorCode: 'KFINTECH_SERVER_DOWN',
          message: 'KFintech portal is currently experiencing high load. Please try again shortly.',
        };
      }

      // If portal requires CAPTCHA / user verification
      return {
        status: 'CAPTCHA_REQUIRED',
        sharesAllotted: 0,
        lotsAllotted: 0,
        checkedAt,
        source: 'KFINTECH',
        officialUrl: this.officialUrl,
        message: 'KFintech official portal requires security verification.',
      };

    } catch (err: any) {
      return {
        status: 'ERROR',
        sharesAllotted: 0,
        lotsAllotted: 0,
        checkedAt,
        source: 'KFINTECH',
        officialUrl: this.officialUrl,
        errorCode: 'KFINTECH_FETCH_ERROR',
        message: err.message || 'Failed to connect to KFintech portal.',
      };
    }
  }
}
