import { AllotmentResult, CheckAllotmentParams } from './types';

export abstract class RegistrarAdapter {
  abstract readonly code: string;
  abstract readonly name: string;
  abstract readonly officialUrl: string;

  /**
   * Checks allotment for a given IPO and PAN using legitimate enquiry mechanisms.
   */
  abstract checkAllotment(params: CheckAllotmentParams): Promise<AllotmentResult>;
}
