export type AllotmentStatusType =
  | 'PENDING'
  | 'CHECKING'
  | 'ALLOTTED'
  | 'NOT_ALLOTTED'
  | 'ERROR'
  | 'CAPTCHA_REQUIRED'
  | 'TEMPORARILY_UNAVAILABLE';

export interface AllotmentResult {
  status: AllotmentStatusType;
  sharesAllotted: number;
  lotsAllotted: number;
  applicationNumber?: string;
  checkedAt: string;
  source: string; // e.g., "KFINTECH", "LINK_INTIME", "BIGSHARE", "CAMEO", "MOCK"
  officialUrl?: string;
  message?: string;
  errorCode?: string;
}

export interface VerificationContext {
  sessionId: string;
  registrarCode: string;
  captchaImageBase64?: string;
  captchaInstructions?: string;
  expiresAt: string;
  verificationState: 'PENDING' | 'VERIFIED' | 'EXPIRED';
}

export interface CheckAllotmentParams {
  ipoSymbol: string;
  ipoName: string;
  pan: string;
  applicationNumber?: string;
  verificationContext?: VerificationContext;
}
