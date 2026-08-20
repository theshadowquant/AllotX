import { RegistrarAdapter } from './RegistrarAdapter';
import { AllotmentResult, CheckAllotmentParams } from './types';

export class MUFGIntimeAdapter extends RegistrarAdapter {
  readonly code = 'LINK_INTIME';
  readonly name = 'Link Intime (MUFG)';
  readonly officialUrl = 'https://linkintime.co.in/initial_offer/public-issues.html';

  async checkAllotment(params: CheckAllotmentParams): Promise<AllotmentResult> {
    const { pan } = params;
    const checkedAt = new Date().toISOString();

    try {
      const isMockMode = process.env.DATA_PROVIDER === 'mock';

      if (isMockMode) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const lastDigit = pan.slice(-1);
        if (['L', '5', '7'].includes(lastDigit)) {
          return {
            status: 'ALLOTTED',
            sharesAllotted: 15,
            lotsAllotted: 1,
            applicationNumber: `LI-${Math.floor(100000 + Math.random() * 900000)}`,
            checkedAt,
            source: 'LINK_INTIME',
            officialUrl: this.officialUrl,
            message: 'Allotted 15 shares (1 Lot) via Link Intime',
          };
        }
        return {
          status: 'NOT_ALLOTTED',
          sharesAllotted: 0,
          lotsAllotted: 0,
          checkedAt,
          source: 'LINK_INTIME',
          officialUrl: this.officialUrl,
          message: 'No allotment found in Link Intime records.',
        };
      }

      return {
        status: 'CAPTCHA_REQUIRED',
        sharesAllotted: 0,
        lotsAllotted: 0,
        checkedAt,
        source: 'LINK_INTIME',
        officialUrl: this.officialUrl,
        message: 'Link Intime portal requires security verification code.',
      };

    } catch (err: any) {
      return {
        status: 'ERROR',
        sharesAllotted: 0,
        lotsAllotted: 0,
        checkedAt,
        source: 'LINK_INTIME',
        officialUrl: this.officialUrl,
        errorCode: 'LINK_INTIME_ERROR',
        message: err.message || 'Link Intime portal request failed.',
      };
    }
  }
}
