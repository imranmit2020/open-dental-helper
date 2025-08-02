interface RevenueOpportunity {
  id: string;
  patientId: string;
  patientName: string;
  treatmentType: string;
  estimatedRevenue: number;
  currentStatus: 'pending' | 'proposed' | 'declined' | 'accepted';
  priority: 'high' | 'medium' | 'low';
  caseAcceptanceProbability: number;
  recommendations: string[];
  lastContact: Date;
  followUpSuggested: Date;
}

interface CaseAcceptanceStrategy {
  strategyType: string;
  description: string;
  expectedImprovement: number;
  implementationEffort: 'low' | 'medium' | 'high';
  targetAudience: string[];
}

interface RevenueAnalysis {
  totalPotentialRevenue: number;
  currentAcceptanceRate: number;
  projectedImprovement: number;
  topOpportunities: RevenueOpportunity[];
  recommendedStrategies: CaseAcceptanceStrategy[];
  revenueByTreatmentType: { [key: string]: number };
}

export class AIRevenueAdvisorService {
  static async analyzeRevenueOpportunities(): Promise<RevenueAnalysis> {
    // Simulate AI analysis with realistic dental practice data
    await new Promise(resolve => setTimeout(resolve, 1500));

    const opportunities: RevenueOpportunity[] = [
      {
        id: '1',
        patientId: 'p1',
        patientName: 'Sarah Johnson',
        treatmentType: 'Invisalign Treatment',
        estimatedRevenue: 5500,
        currentStatus: 'pending',
        priority: 'high',
        caseAcceptanceProbability: 0.75,
        recommendations: [
          'Schedule in-person consultation for treatment visualization',
          'Offer flexible payment plan options',
          'Share before/after case studies'
        ],
        lastContact: new Date('2024-01-15'),
        followUpSuggested: new Date('2024-02-15')
      },
      {
        id: '2',
        patientId: 'p2',
        patientName: 'Michael Chen',
        treatmentType: 'Crown & Bridge Work',
        estimatedRevenue: 3200,
        currentStatus: 'declined',
        priority: 'medium',
        caseAcceptanceProbability: 0.45,
        recommendations: [
          'Present alternative material options',
          'Explain long-term cost benefits',
          'Offer insurance verification assistance'
        ],
        lastContact: new Date('2024-01-20'),
        followUpSuggested: new Date('2024-02-20')
      },
      {
        id: '3',
        patientId: 'p3',
        patientName: 'Emma Rodriguez',
        treatmentType: 'Periodontal Treatment',
        estimatedRevenue: 2800,
        currentStatus: 'proposed',
        priority: 'high',
        caseAcceptanceProbability: 0.85,
        recommendations: [
          'Schedule urgent follow-up call',
          'Emphasize health risks of delay',
          'Provide educational materials'
        ],
        lastContact: new Date('2024-01-25'),
        followUpSuggested: new Date('2024-02-10')
      }
    ];

    const strategies: CaseAcceptanceStrategy[] = [
      {
        strategyType: 'Payment Plan Enhancement',
        description: 'Implement 0% interest payment plans for treatments over $1000',
        expectedImprovement: 0.15,
        implementationEffort: 'low',
        targetAudience: ['High-value treatments', 'Price-sensitive patients']
      },
      {
        strategyType: 'Treatment Visualization',
        description: 'Use digital smile design and 3D treatment previews',
        expectedImprovement: 0.25,
        implementationEffort: 'medium',
        targetAudience: ['Cosmetic treatments', 'Orthodontics']
      },
      {
        strategyType: 'Follow-up Automation',
        description: 'Automated reminder system for pending treatment decisions',
        expectedImprovement: 0.12,
        implementationEffort: 'low',
        targetAudience: ['All pending cases']
      }
    ];

    return {
      totalPotentialRevenue: 87500,
      currentAcceptanceRate: 0.68,
      projectedImprovement: 0.18,
      topOpportunities: opportunities,
      recommendedStrategies: strategies,
      revenueByTreatmentType: {
        'Implants': 25000,
        'Orthodontics': 18000,
        'Cosmetic': 15000,
        'Restorative': 12000,
        'Periodontal': 8500,
        'Preventive': 9000
      }
    };
  }

  static async getPatientCaseAcceptanceFactors(patientId: string): Promise<{
    financialCapacity: number;
    treatmentUrgency: number;
    historicalAcceptance: number;
    communicationPreference: string;
    riskFactors: string[];
    successFactors: string[];
  }> {
    await new Promise(resolve => setTimeout(resolve, 800));

    return {
      financialCapacity: 0.75,
      treatmentUrgency: 0.90,
      historicalAcceptance: 0.85,
      communicationPreference: 'email',
      riskFactors: [
        'Previous treatment postponements',
        'Insurance coverage questions'
      ],
      successFactors: [
        'High treatment compliance',
        'Strong doctor-patient relationship',
        'Understanding of treatment benefits'
      ]
    };
  }

  static async generateCaseAcceptanceScript(treatmentType: string, patientFactors: any): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const scripts = {
      'Invisalign Treatment': `Hi [Patient Name], I wanted to follow up on our discussion about your Invisalign treatment. Based on your lifestyle and goals, this treatment would be perfect for achieving the smile you've always wanted. We also have flexible payment options starting at $150/month that can make this investment more manageable. Would you like to schedule a time to discuss the details?`,
      'Crown & Bridge Work': `Hello [Patient Name], I hope you're doing well. I wanted to reach out regarding the crown treatment we discussed. This procedure will not only restore your tooth's function but also prevent more serious complications down the line. We can work with your insurance to maximize your benefits. When would be a good time to move forward?`,
      'Periodontal Treatment': `Dear [Patient Name], Following our consultation, I want to emphasize how important it is to address your gum health promptly. Periodontal disease can affect your overall health, not just your teeth. We've had excellent results with this treatment, and early intervention will save you time and money in the long run. Let's schedule your treatment soon.`
    };

    return scripts[treatmentType] || 'Personalized treatment communication based on patient needs and treatment urgency.';
  }
}