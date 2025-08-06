interface InsuranceEligibility {
  patientId: string;
  patientName: string;
  insuranceProvider: string;
  policyNumber: string;
  isActive: boolean;
  coverage: {
    preventive: number;
    basic: number;
    major: number;
  };
  deductible: {
    total: number;
    met: number;
    remaining: number;
  };
  annualMaximum: {
    total: number;
    used: number;
    remaining: number;
  };
  estimatedCoPay: number;
  recommendedBillingCodes: string[];
  eligibilityNotes: string[];
}

interface RevenueLeakage {
  id: string;
  type: 'unbilled_procedure' | 'missed_claim' | 'rejected_claim' | 'undercharged' | 'missing_documentation';
  patientId: string;
  patientName: string;
  description: string;
  potentialRevenue: number;
  priority: 'high' | 'medium' | 'low';
  solution: string;
  actionRequired: string;
  estimatedRecoveryTime: string;
  aiConfidence: number;
}

interface NoShowPrediction {
  patientId: string;
  patientName: string;
  appointmentId: string;
  appointmentDate: Date;
  treatmentType: string;
  appointmentValue: number;
  noShowProbability: number;
  riskFactors: string[];
  recommendedActions: {
    action: string;
    timing: string;
    channel: 'sms' | 'email' | 'phone';
    message: string;
  }[];
  incentives: {
    type: string;
    description: string;
    value: number;
  }[];
}

interface OptimalBillingCode {
  originalCode: string;
  recommendedCode: string;
  description: string;
  originalFee: number;
  recommendedFee: number;
  revenueIncrease: number;
  insuranceApprovalRate: number;
  reason: string;
}

export class RevenueOptimizationService {
  static async verifyInsuranceWithCoPay(patientId: string, treatmentCodes: string[]): Promise<InsuranceEligibility> {
    // Simulate real-time insurance verification
    await new Promise(resolve => setTimeout(resolve, 1200));

    const mockEligibility: InsuranceEligibility = {
      patientId,
      patientName: "Sarah Johnson",
      insuranceProvider: "Delta Dental Premier",
      policyNumber: "DD789456123",
      isActive: true,
      coverage: {
        preventive: 100,
        basic: 80,
        major: 50
      },
      deductible: {
        total: 150,
        met: 75,
        remaining: 75
      },
      annualMaximum: {
        total: 2000,
        used: 650,
        remaining: 1350
      },
      estimatedCoPay: this.calculateCoPay(treatmentCodes),
      recommendedBillingCodes: await this.getOptimalBillingCodesSimple(treatmentCodes),
      eligibilityNotes: [
        "Preventive care covered at 100%",
        "No waiting period for basic procedures",
        "Pre-authorization required for major work over $500"
      ]
    };

    return mockEligibility;
  }

  static async detectRevenueLeakage(): Promise<RevenueLeakage[]> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    return [
      {
        id: "RL001",
        type: "unbilled_procedure",
        patientId: "p123",
        patientName: "Michael Chen",
        description: "Fluoride treatment performed but not billed",
        potentialRevenue: 45,
        priority: "medium",
        solution: "Add procedure code D1208 to existing claim",
        actionRequired: "Update billing system with missing procedure",
        estimatedRecoveryTime: "1-2 days",
        aiConfidence: 0.94
      },
      {
        id: "RL002",
        type: "rejected_claim",
        patientId: "p456",
        patientName: "Emma Rodriguez",
        description: "Crown claim rejected due to missing pre-authorization",
        potentialRevenue: 1200,
        priority: "high",
        solution: "Submit pre-authorization request and resubmit claim",
        actionRequired: "Contact insurance for retro-authorization",
        estimatedRecoveryTime: "7-14 days",
        aiConfidence: 0.89
      },
      {
        id: "RL003",
        type: "undercharged",
        patientId: "p789",
        patientName: "David Kim",
        description: "Composite filling billed at amalgam rate",
        potentialRevenue: 85,
        priority: "medium",
        solution: "Adjust billing code from D2140 to D2391",
        actionRequired: "Submit corrected claim with proper documentation",
        estimatedRecoveryTime: "3-5 days",
        aiConfidence: 0.97
      },
      {
        id: "RL004",
        type: "missing_documentation",
        patientId: "p321",
        patientName: "Lisa Thompson",
        description: "Periodontal therapy claim pending documentation",
        potentialRevenue: 650,
        priority: "high",
        solution: "Attach periodontal charting and radiographs",
        actionRequired: "Upload supporting documentation to claim",
        estimatedRecoveryTime: "2-3 days",
        aiConfidence: 0.91
      },
      {
        id: "RL005",
        type: "missed_claim",
        patientId: "p654",
        patientName: "Robert Wilson",
        description: "Emergency visit from 30 days ago never submitted",
        potentialRevenue: 180,
        priority: "medium",
        solution: "Submit retroactive claim for emergency treatment",
        actionRequired: "Create and submit new claim within timely filing limits",
        estimatedRecoveryTime: "5-7 days",
        aiConfidence: 0.86
      }
    ];
  }

  static async predictNoShows(dateRange: { start: Date; end: Date }): Promise<NoShowPrediction[]> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    return [
      {
        patientId: "p987",
        patientName: "Jennifer Adams",
        appointmentId: "apt001",
        appointmentDate: new Date("2024-02-15T10:00:00"),
        treatmentType: "Crown Preparation",
        appointmentValue: 1200,
        noShowProbability: 0.78,
        riskFactors: [
          "History of 2 no-shows in last 6 months",
          "Appointment scheduled >2 weeks in advance",
          "High-cost procedure",
          "No recent contact with practice"
        ],
        recommendedActions: [
          {
            action: "Send appointment confirmation",
            timing: "48 hours before",
            channel: "sms",
            message: "Hi Jennifer! This is a reminder of your crown prep appointment on Thursday at 10 AM. Please reply YES to confirm or call us to reschedule."
          },
          {
            action: "Follow-up call",
            timing: "24 hours before",
            channel: "phone",
            message: "Personal call to discuss treatment and address any concerns"
          }
        ],
        incentives: [
          {
            type: "early_arrival_discount",
            description: "5% discount for arriving 15 minutes early",
            value: 60
          },
          {
            type: "referral_credit",
            description: "$25 credit for referring a friend",
            value: 25
          }
        ]
      },
      {
        patientId: "p543",
        patientName: "Mark Thompson",
        appointmentId: "apt002",
        appointmentDate: new Date("2024-02-16T14:30:00"),
        treatmentType: "Dental Cleaning",
        appointmentValue: 120,
        noShowProbability: 0.65,
        riskFactors: [
          "New patient - first appointment",
          "Appointment made online without phone contact",
          "Friday afternoon slot"
        ],
        recommendedActions: [
          {
            action: "Welcome call",
            timing: "2-3 days before",
            channel: "phone",
            message: "Welcome new patient, explain what to expect, confirm appointment"
          },
          {
            action: "Text reminder with directions",
            timing: "24 hours before",
            channel: "sms",
            message: "Welcome to our practice! Your cleaning is tomorrow at 2:30 PM. We're located at [address]. Please arrive 15 minutes early for paperwork."
          }
        ],
        incentives: [
          {
            type: "new_patient_discount",
            description: "20% discount on first cleaning",
            value: 24
          }
        ]
      },
      {
        patientId: "p876",
        patientName: "Rachel Green",
        appointmentId: "apt003",
        appointmentDate: new Date("2024-02-17T16:00:00"),
        treatmentType: "Orthodontic Consultation",
        appointmentValue: 200,
        noShowProbability: 0.45,
        riskFactors: [
          "Teenage patient - parent scheduling",
          "Late afternoon appointment",
          "Consultation only - not urgent"
        ],
        recommendedActions: [
          {
            action: "Contact parent directly",
            timing: "3 days before",
            channel: "phone",
            message: "Confirm with parent and discuss orthodontic consultation process"
          },
          {
            action: "Send educational material",
            timing: "2 days before",
            channel: "email",
            message: "Email about orthodontic treatment benefits and what to expect during consultation"
          }
        ],
        incentives: [
          {
            type: "consultation_credit",
            description: "Credit consultation fee toward treatment if started within 30 days",
            value: 200
          }
        ]
      }
    ];
  }

  static async getOptimalBillingCodes(originalCodes: string[]): Promise<OptimalBillingCode[]> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const optimizations: OptimalBillingCode[] = [];

    for (const code of originalCodes) {
      if (code === "D2140") {
        optimizations.push({
          originalCode: "D2140",
          recommendedCode: "D2391",
          description: "Composite restoration instead of amalgam",
          originalFee: 150,
          recommendedFee: 235,
          revenueIncrease: 85,
          insuranceApprovalRate: 0.94,
          reason: "Material actually used supports higher billing code"
        });
      } else if (code === "D1110") {
        optimizations.push({
          originalCode: "D1110",
          recommendedCode: "D1110",
          description: "Adult prophylaxis - optimal code",
          originalFee: 75,
          recommendedFee: 75,
          revenueIncrease: 0,
          insuranceApprovalRate: 0.99,
          reason: "Already using optimal billing code"
        });
      }
    }

    return optimizations;
  }

  private static calculateCoPay(treatmentCodes: string[]): number {
    let totalCoPay = 0;
    
    treatmentCodes.forEach(code => {
      switch (code) {
        case "D1110": // Prophylaxis
          totalCoPay += 0; // Covered at 100%
          break;
        case "D2140": // Amalgam restoration
          totalCoPay += 30; // 20% of $150
          break;
        case "D2750": // Crown
          totalCoPay += 600; // 50% of $1200
          break;
        default:
          totalCoPay += 25; // Default copay
      }
    });

    return totalCoPay;
  }

  private static async getOptimalBillingCodesSimple(treatmentCodes: string[]): Promise<string[]> {
    return treatmentCodes.map(code => {
      // Suggest optimal billing codes based on AI analysis
      const optimizations: Record<string, string> = {
        "D2140": "D2391", // Suggest composite over amalgam
        "D1110": "D1110", // Already optimal
        "D2750": "D2750"  // Already optimal
      };
      return optimizations[code] || code;
    });
  }

  static async generateAutomatedReminder(prediction: NoShowPrediction): Promise<{
    messageContent: string;
    sendTime: Date;
    channel: string;
  }> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const appointmentDate = prediction.appointmentDate;
    const reminderTime = new Date(appointmentDate.getTime() - (24 * 60 * 60 * 1000)); // 24 hours before

    let messageContent = `Hi ${prediction.patientName}! This is a friendly reminder about your ${prediction.treatmentType} appointment tomorrow at ${appointmentDate.toLocaleTimeString()}. `;

    if (prediction.noShowProbability > 0.7) {
      messageContent += `We're looking forward to seeing you! If you need to reschedule, please call us as soon as possible. `;
      
      if (prediction.incentives.length > 0) {
        const incentive = prediction.incentives[0];
        messageContent += `As a valued patient, we're offering ${incentive.description}. `;
      }
    }

    messageContent += "Reply YES to confirm or call (555) 123-4567 to reschedule.";

    return {
      messageContent,
      sendTime: reminderTime,
      channel: prediction.recommendedActions[0]?.channel || "sms"
    };
  }
}