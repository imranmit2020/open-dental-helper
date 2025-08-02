export interface InsuranceVerification {
  id: string;
  patientId: string;
  provider: string;
  policyNumber: string;
  status: 'verified' | 'pending' | 'rejected' | 'expired';
  eligibility: {
    active: boolean;
    planType: string;
    deductible: number;
    deductibleMet: number;
    annualMaximum: number;
    annualUsed: number;
    preventiveRemaining: number;
    basicRemaining: number;
    majorRemaining: number;
  };
  verifiedAt: Date;
  errors?: string[];
}

export interface ClaimPrediction {
  claimId: string;
  patientId: string;
  treatmentCodes: string[];
  predictedApproval: number; // 0-1 probability
  estimatedReimbursement: number;
  riskFactors: string[];
  suggestedChanges: string[];
  submissionReady: boolean;
}

export class AIInsuranceService {
  static async verifyInsurance(patientId: string, insuranceInfo: any): Promise<InsuranceVerification> {
    // Simulate AI-powered insurance verification
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockVerification: InsuranceVerification = {
      id: crypto.randomUUID(),
      patientId,
      provider: insuranceInfo.provider,
      policyNumber: insuranceInfo.policyNumber,
      status: Math.random() > 0.1 ? 'verified' : 'pending',
      eligibility: {
        active: true,
        planType: 'PPO',
        deductible: 500,
        deductibleMet: 150,
        annualMaximum: 2000,
        annualUsed: 450,
        preventiveRemaining: 100,
        basicRemaining: 80,
        majorRemaining: 50
      },
      verifiedAt: new Date(),
      errors: Math.random() > 0.8 ? ['Missing signature on file'] : undefined
    };

    return mockVerification;
  }

  static async predictClaim(patientId: string, treatmentCodes: string[]): Promise<ClaimPrediction> {
    // AI prediction for claim approval
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const baseApproval = Math.random() * 0.4 + 0.6; // 60-100% approval rate
    const risks = [];
    const suggestions = [];

    if (treatmentCodes.some(code => code.startsWith('D7'))) {
      risks.push('Oral surgery requires pre-authorization');
      suggestions.push('Submit pre-auth request first');
    }

    if (treatmentCodes.length > 3) {
      risks.push('Multiple procedures in single visit');
      suggestions.push('Consider splitting into multiple appointments');
    }

    return {
      claimId: crypto.randomUUID(),
      patientId,
      treatmentCodes,
      predictedApproval: baseApproval,
      estimatedReimbursement: treatmentCodes.length * 120 + Math.random() * 200,
      riskFactors: risks,
      suggestedChanges: suggestions,
      submissionReady: risks.length === 0
    };
  }

  static async autoFillClaim(patientId: string, treatmentCodes: string[]): Promise<any> {
    // AI auto-fills claim forms
    return {
      patientInfo: {
        name: 'Auto-filled from patient record',
        dateOfBirth: 'Auto-filled',
        address: 'Auto-filled'
      },
      treatmentInfo: treatmentCodes.map(code => ({
        code,
        description: this.getCodeDescription(code),
        fee: this.getStandardFee(code),
        date: new Date().toISOString().split('T')[0]
      })),
      providerInfo: {
        npi: 'Auto-filled',
        taxId: 'Auto-filled',
        address: 'Auto-filled'
      }
    };
  }

  private static getCodeDescription(code: string): string {
    const descriptions: Record<string, string> = {
      'D0150': 'Comprehensive oral evaluation',
      'D1110': 'Prophylaxis - adult',
      'D2140': 'Amalgam restoration - one surface',
      'D2750': 'Crown - porcelain fused to metal',
      'D7140': 'Extraction - erupted tooth'
    };
    return descriptions[code] || 'Treatment procedure';
  }

  private static getStandardFee(code: string): number {
    const fees: Record<string, number> = {
      'D0150': 85,
      'D1110': 75,
      'D2140': 150,
      'D2750': 900,
      'D7140': 125
    };
    return fees[code] || 100;
  }
}