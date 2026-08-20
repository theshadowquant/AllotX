import { RegistrarAdapter } from './RegistrarAdapter';
import { AllotmentResult, CheckAllotmentParams } from './types';

export class CameoAdapter extends RegistrarAdapter {
  readonly code = 'CAMEO';
  readonly name = 'Cameo Corporate Services';
  readonly officialUrl = 'https://ipo.cameoindia.com/';

  async checkAllotment(params: CheckAllotmentParams): Promise<AllotmentResult> {
    const { pan } = params;
    const checkedAt = new Date().toISOString();

    const isMockMode = process.env.DATA_PROVIDER === 'mock';
    if (isMockMode) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        status: 'NOT_ALLOTTED',
        sharesAllotted: 0,
        lotsAllotted: 0,
        checkedAt,
        source: 'CAMEO',
        officialUrl: this.officialUrl,
        message: 'No allotment record found on Cameo Corporate Services.',
      };
    }

    return {
      status: 'CAPTCHA_REQUIRED',
      sharesAllotted: 0,
      lotsAllotted: 0,
      checkedAt,
      source: 'CAMEO',
      officialUrl: this.officialUrl,
      message: 'Cameo portal security verification required.',
    };
  }
}
