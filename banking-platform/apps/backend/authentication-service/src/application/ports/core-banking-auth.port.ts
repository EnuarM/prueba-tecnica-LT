export interface MulesoftUserData {
  govIssueIdent: {
    govIssueIdentType: string;
    identSerialNum: string;
  };
  personName: {
    fullName: string;
    lastAuthInfo: {
      lastTrnDt: string;
    };
  };
}

export abstract class CoreBankingAuthPort {
  abstract authenticate(
    docNumber: string,
    password: string,
  ): Promise<MulesoftUserData>;
}
