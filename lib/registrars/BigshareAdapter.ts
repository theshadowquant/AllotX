import { RegistrarAdapter } from './RegistrarAdapter';
import { AllotmentResult, CheckAllotmentParams } from './types';

export class BigshareAdapter extends RegistrarAdapter {
  readonly code = 'BIGSHARE';
  readonly name = 'Bigshare Services';
  readonly officialUrl = 'https://www.bigshareonline.com/ipo_allotment.html';

  async checkAllotment(params: CheckAllotmentParams): Promise<AllotmentResult> {
    const { pan } = params;
    const checkedAt = new Date().toISOString();

    const isMockMode = process.env.DATA_PROVIDER === 'mock';
    if (isMockMode) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const lastDigit = pan.slice(-1);
      if (['B', '4'].includes(lastDigit)) {
        return {
          status: 'ALLOTTED',
          sharesAllotted: 200,
          lotsAllotted: 1,
          applicationNumber: `BS-${Math.floor(100000 + Math.random() * 900000)}`,
          checkedAt,
          source: 'BIGSHARE',
          officialUrl: this.officialUrl,
          message: 'Allotted 200 Shares (1 SME Lot) via Bigshare',
        };
      }
      return {
        status: 'NOT_ALLOTTED',
        sharesAllotted: 0,
        lotsAllotted: 0,
        checkedAt,
        source: 'BIGSHARE',
        officialUrl: this.officialUrl,
        message: 'Non-allotted according to Bigshare records.',
      };
    }

    return {
      status: 'CAPTCHA_REQUIRED',
      sharesAllotted: 0,
      lotsAllotted: 0,
      checkedAt,
      source: 'BIGSHARE',
      officialUrl: this.officialUrl,
      message: 'Bigshare Services requires CAPTCHA input.',
    };
  }
}
