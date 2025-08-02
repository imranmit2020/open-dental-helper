export interface TreatmentOption {
  id: string;
  name: string;
  procedures: string[];
  estimatedCost: number;
  duration: number; // in weeks
  urgency: 'immediate' | 'soon' | 'routine';
  successRate: number;
  alternatives: string[];
  riskFactors: string[];
  benefits: string[];
  aiConfidence: number;
}

export interface XRayAnalysis {
  imageId: string;
  findings: {
    cavities: Array<{ tooth: string; severity: 'minor' | 'moderate' | 'severe'; location: string }>;
    boneLoss: Array<{ area: string; percentage: number }>;
    rootIssues: Array<{ tooth: string; issue: string }>;
    abnormalities: Array<{ type: string; description: string; location: string }>;
  };
  recommendedTreatments: string[];
  urgentFindings: string[];
  confidence: number;
  annotatedImageUrl?: string;
}

export class AITreatmentPlanningService {
  static async analyzeTreatmentHistory(patientId: string): Promise<{
    treatmentPatterns: string[];
    riskFactors: string[];
    recommendations: string[];
    predictedNeeds: TreatmentOption[];
  }> {
    // AI analyzes patient's treatment history for patterns
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      treatmentPatterns: [
        'High cavity rate in posterior teeth',
        'Good oral hygiene maintenance',
        'Regular recall compliance'
      ],
      riskFactors: [
        'History of periodontal disease',
        'Bruxism noted in previous visits',
        'High sugar diet reported'
      ],
      recommendations: [
        'Consider fluoride treatments',
        'Night guard for bruxism',
        'Quarterly cleanings instead of bi-annual'
      ],
      predictedNeeds: await this.generateTreatmentOptions(patientId)
    };
  }

  static async generateTreatmentOptions(patientId: string): Promise<TreatmentOption[]> {
    // AI generates treatment plan options
    const options: TreatmentOption[] = [
      {
        id: '1',
        name: 'Conservative Treatment Plan',
        procedures: ['D1110 - Prophylaxis', 'D0150 - Comprehensive exam', 'D1206 - Fluoride treatment'],
        estimatedCost: 285,
        duration: 2,
        urgency: 'routine',
        successRate: 0.95,
        alternatives: ['Immediate treatment plan'],
        riskFactors: ['May require additional treatment if conditions worsen'],
        benefits: ['Lower cost', 'Less invasive', 'Preventive approach'],
        aiConfidence: 0.88
      },
      {
        id: '2',
        name: 'Comprehensive Restoration Plan',
        procedures: ['D2750 - Crown #14', 'D2140 - Filling #15', 'D4341 - Scaling and root planing'],
        estimatedCost: 1450,
        duration: 6,
        urgency: 'soon',
        successRate: 0.92,
        alternatives: ['Phased treatment approach'],
        riskFactors: ['Multiple appointments required', 'Higher cost'],
        benefits: ['Complete restoration', 'Long-term solution', 'Prevents further damage'],
        aiConfidence: 0.91
      },
      {
        id: '3',
        name: 'Emergency Treatment Plan',
        procedures: ['D7140 - Extraction #32', 'D9110 - Palliative treatment'],
        estimatedCost: 275,
        duration: 1,
        urgency: 'immediate',
        successRate: 0.98,
        alternatives: ['Root canal therapy'],
        riskFactors: ['Permanent tooth loss'],
        benefits: ['Immediate pain relief', 'Prevents infection spread'],
        aiConfidence: 0.85
      }
    ];

    return options;
  }

  static async analyzeXRay(imageUrl: string): Promise<XRayAnalysis> {
    // AI X-ray analysis simulation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      imageId: crypto.randomUUID(),
      findings: {
        cavities: [
          { tooth: '#14', severity: 'moderate', location: 'occlusal surface' },
          { tooth: '#15', severity: 'minor', location: 'mesial surface' }
        ],
        boneLoss: [
          { area: 'posterior mandible', percentage: 15 }
        ],
        rootIssues: [
          { tooth: '#32', issue: 'periapical radiolucency' }
        ],
        abnormalities: [
          { type: 'calculus', description: 'Heavy calculus deposits', location: 'lower anterior' }
        ]
      },
      recommendedTreatments: [
        'Crown for tooth #14',
        'Composite filling for tooth #15',
        'Deep cleaning',
        'Root canal evaluation for tooth #32'
      ],
      urgentFindings: [
        'Tooth #32 requires immediate attention'
      ],
      confidence: 0.89,
      annotatedImageUrl: `${imageUrl}?annotated=true`
    };
  }

  static async predictTreatmentOutcome(treatmentOption: TreatmentOption, patientFactors: any): Promise<{
    successProbability: number;
    complications: string[];
    timeline: string;
    costAccuracy: number;
    alternativeRecommendation?: string;
  }> {
    // AI predicts treatment outcome based on patient factors
    let baseProbability = treatmentOption.successRate;
    
    // Adjust based on patient factors
    if (patientFactors.age > 65) baseProbability -= 0.05;
    if (patientFactors.smokingHistory) baseProbability -= 0.1;
    if (patientFactors.diabetes) baseProbability -= 0.08;
    if (patientFactors.goodOralHygiene) baseProbability += 0.05;

    const complications = [];
    if (patientFactors.medicationAllergies) complications.push('Potential medication reactions');
    if (patientFactors.bleedingDisorder) complications.push('Increased bleeding risk');
    if (patientFactors.immunocompromised) complications.push('Delayed healing');

    return {
      successProbability: Math.max(0.7, baseProbability),
      complications,
      timeline: `${treatmentOption.duration} weeks ± 1 week`,
      costAccuracy: 0.85,
      alternativeRecommendation: baseProbability < 0.8 ? 'Consider less invasive treatment option' : undefined
    };
  }

  static async generateTreatmentSequence(treatments: TreatmentOption[]): Promise<{
    phases: Array<{
      phase: number;
      procedures: string[];
      duration: number;
      reasoning: string;
    }>;
    totalDuration: number;
    totalCost: number;
  }> {
    // AI optimizes treatment sequence
    const phases = [
      {
        phase: 1,
        procedures: treatments.filter(t => t.urgency === 'immediate').flatMap(t => t.procedures),
        duration: 2,
        reasoning: 'Address urgent conditions first to prevent complications'
      },
      {
        phase: 2,
        procedures: treatments.filter(t => t.urgency === 'soon').flatMap(t => t.procedures),
        duration: 4,
        reasoning: 'Restore function and prevent progression'
      },
      {
        phase: 3,
        procedures: treatments.filter(t => t.urgency === 'routine').flatMap(t => t.procedures),
        duration: 2,
        reasoning: 'Complete preventive and maintenance treatments'
      }
    ].filter(phase => phase.procedures.length > 0);

    return {
      phases,
      totalDuration: phases.reduce((sum, phase) => sum + phase.duration, 0),
      totalCost: treatments.reduce((sum, treatment) => sum + treatment.estimatedCost, 0)
    };
  }
}