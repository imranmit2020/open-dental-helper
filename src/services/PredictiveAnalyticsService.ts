interface PatientData {
  age: number;
  gender: string;
  medicalHistory: string[];
  dentalHistory: string[];
  lifestyle: {
    smoking: boolean;
    drinking: boolean;
    sugarIntake: 'low' | 'medium' | 'high';
    oralHygiene: 'poor' | 'fair' | 'good' | 'excellent';
  };
  currentConditions: string[];
}

interface TreatmentPrediction {
  treatment: string;
  successProbability: number;
  timeToCompletion: number;
  complications: string[];
  alternativeTreatments: string[];
  costEstimate: number;
}

interface CavityProgression {
  currentStage: string;
  progressionRate: number;
  timeToNextStage: number;
  preventionMeasures: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'urgent';
}

export class PredictiveAnalyticsService {
  private treatmentSuccessRates = {
    'filling': { base: 0.95, ageImpact: -0.001, smokingImpact: -0.1 },
    'crown': { base: 0.90, ageImpact: -0.002, smokingImpact: -0.05 },
    'root_canal': { base: 0.85, ageImpact: -0.003, smokingImpact: -0.15 },
    'extraction': { base: 0.98, ageImpact: -0.0005, smokingImpact: -0.02 },
    'implant': { base: 0.92, ageImpact: -0.005, smokingImpact: -0.2 },
    'periodontal_treatment': { base: 0.80, ageImpact: -0.002, smokingImpact: -0.25 }
  };

  private cavityProgressionRates = {
    'initial': { progressionDays: 180, nextStage: 'enamel' },
    'enamel': { progressionDays: 120, nextStage: 'dentin' },
    'dentin': { progressionDays: 60, nextStage: 'pulp' },
    'pulp': { progressionDays: 30, nextStage: 'abscess' }
  };

  predictTreatmentOutcome(patientData: PatientData, treatment: string): TreatmentPrediction {
    const baseRate = this.treatmentSuccessRates[treatment as keyof typeof this.treatmentSuccessRates];
    
    if (!baseRate) {
      throw new Error(`Treatment ${treatment} not supported`);
    }

    let successProbability = baseRate.base;
    
    // Age factor
    successProbability += baseRate.ageImpact * patientData.age;
    
    // Smoking factor
    if (patientData.lifestyle.smoking) {
      successProbability += baseRate.smokingImpact;
    }
    
    // Medical history impact
    const complicatingConditions = ['diabetes', 'osteoporosis', 'autoimmune'];
    const hasComplicatingCondition = patientData.medicalHistory.some(condition =>
      complicatingConditions.includes(condition.toLowerCase())
    );
    
    if (hasComplicatingCondition) {
      successProbability -= 0.1;
    }
    
    // Oral hygiene impact
    const hygieneImpact = {
      'poor': -0.15,
      'fair': -0.05,
      'good': 0.05,
      'excellent': 0.1
    };
    
    successProbability += hygieneImpact[patientData.lifestyle.oralHygiene];
    
    // Ensure probability is between 0 and 1
    successProbability = Math.max(0, Math.min(1, successProbability));
    
    const complications = this.predictComplications(patientData, treatment);
    const alternatives = this.getAlternativeTreatments(treatment);
    const timeToCompletion = this.estimateCompletionTime(treatment, patientData);
    const costEstimate = this.estimateCost(treatment, patientData);

    return {
      treatment,
      successProbability,
      timeToCompletion,
      complications,
      alternativeTreatments: alternatives,
      costEstimate
    };
  }

  predictCavityProgression(currentStage: string, patientData: PatientData): CavityProgression {
    const stageData = this.cavityProgressionRates[currentStage as keyof typeof this.cavityProgressionRates];
    
    if (!stageData) {
      throw new Error(`Cavity stage ${currentStage} not recognized`);
    }

    let progressionRate = 1.0;
    
    // Risk factors
    if (patientData.lifestyle.sugarIntake === 'high') {
      progressionRate *= 1.5;
    } else if (patientData.lifestyle.sugarIntake === 'medium') {
      progressionRate *= 1.2;
    }
    
    if (patientData.lifestyle.oralHygiene === 'poor') {
      progressionRate *= 1.8;
    } else if (patientData.lifestyle.oralHygiene === 'fair') {
      progressionRate *= 1.3;
    }
    
    if (patientData.lifestyle.smoking) {
      progressionRate *= 1.4;
    }
    
    const baseTimeToNext = stageData.progressionDays;
    const timeToNextStage = Math.round(baseTimeToNext / progressionRate);
    
    const urgencyLevel = this.calculateUrgency(currentStage, timeToNextStage);
    const preventionMeasures = this.getPreventionMeasures(currentStage, patientData);

    return {
      currentStage,
      progressionRate,
      timeToNextStage,
      preventionMeasures,
      urgencyLevel
    };
  }

  private predictComplications(patientData: PatientData, treatment: string): string[] {
    const complications: string[] = [];
    
    if (patientData.age > 65) {
      complications.push('Slower healing process');
    }
    
    if (patientData.lifestyle.smoking) {
      complications.push('Increased infection risk', 'Poor wound healing');
    }
    
    if (patientData.medicalHistory.includes('diabetes')) {
      complications.push('Delayed healing', 'Infection risk');
    }
    
    if (treatment === 'implant' && patientData.medicalHistory.includes('osteoporosis')) {
      complications.push('Implant integration issues');
    }
    
    return complications;
  }

  private getAlternativeTreatments(treatment: string): string[] {
    const alternatives: Record<string, string[]> = {
      'filling': ['crown', 'onlay'],
      'crown': ['filling', 'extraction and implant'],
      'root_canal': ['extraction', 'extraction and implant'],
      'extraction': ['root canal and crown', 'endodontic retreatment'],
      'implant': ['bridge', 'partial denture'],
      'periodontal_treatment': ['scaling and root planing', 'surgical treatment']
    };
    
    return alternatives[treatment] || [];
  }

  private estimateCompletionTime(treatment: string, patientData: PatientData): number {
    const baseTimes: Record<string, number> = {
      'filling': 1,
      'crown': 14,
      'root_canal': 21,
      'extraction': 3,
      'implant': 90,
      'periodontal_treatment': 30
    };
    
    let timeMultiplier = 1;
    
    if (patientData.age > 65) {
      timeMultiplier *= 1.2;
    }
    
    if (patientData.lifestyle.smoking) {
      timeMultiplier *= 1.3;
    }
    
    return Math.round((baseTimes[treatment] || 7) * timeMultiplier);
  }

  private estimateCost(treatment: string, patientData: PatientData): number {
    const baseCosts: Record<string, number> = {
      'filling': 200,
      'crown': 1200,
      'root_canal': 900,
      'extraction': 300,
      'implant': 3500,
      'periodontal_treatment': 800
    };
    
    let costMultiplier = 1;
    
    // Complexity factors
    if (patientData.medicalHistory.length > 2) {
      costMultiplier *= 1.15;
    }
    
    if (patientData.currentConditions.includes('severe')) {
      costMultiplier *= 1.25;
    }
    
    return Math.round((baseCosts[treatment] || 500) * costMultiplier);
  }

  private calculateUrgency(stage: string, timeToNext: number): 'low' | 'medium' | 'high' | 'urgent' {
    if (stage === 'pulp' || timeToNext < 15) {
      return 'urgent';
    } else if (timeToNext < 45) {
      return 'high';
    } else if (timeToNext < 90) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private getPreventionMeasures(stage: string, patientData: PatientData): string[] {
    const measures: string[] = [];
    
    measures.push('Improve oral hygiene routine');
    measures.push('Reduce sugar intake');
    measures.push('Regular dental checkups');
    
    if (patientData.lifestyle.smoking) {
      measures.push('Smoking cessation');
    }
    
    if (stage === 'initial' || stage === 'enamel') {
      measures.push('Fluoride treatment');
      measures.push('Dental sealants');
    }
    
    if (patientData.lifestyle.oralHygiene === 'poor') {
      measures.push('Professional dental cleaning');
      measures.push('Oral hygiene education');
    }
    
    return measures;
  }

  generateTreatmentPlan(patientData: PatientData, conditions: string[]): TreatmentPrediction[] {
    const treatmentMap: Record<string, string> = {
      'cavity': 'filling',
      'damaged_crown': 'crown',
      'infected_tooth': 'root_canal',
      'wisdom_tooth': 'extraction',
      'missing_tooth': 'implant',
      'gum_disease': 'periodontal_treatment'
    };
    
    return conditions.map(condition => {
      const treatment = treatmentMap[condition];
      if (treatment) {
        return this.predictTreatmentOutcome(patientData, treatment);
      }
      throw new Error(`No treatment found for condition: ${condition}`);
    });
  }
}