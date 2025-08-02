export interface CancellationPrediction {
  appointmentId: string;
  patientId: string;
  probability: number; // 0-1
  riskFactors: string[];
  suggestedActions: string[];
  alternativePatients?: string[];
  confidence: number;
}

export interface ScheduleOptimization {
  currentEfficiency: number;
  optimizedSchedule: Array<{
    time: string;
    patientId: string;
    treatmentType: string;
    duration: number;
    chairNumber: number;
  }>;
  improvementPotential: number;
  recommendations: string[];
  gapsFilled: number;
}

export interface ChairUtilization {
  chairId: string;
  utilization: number; // 0-1
  peakHours: string[];
  suggestions: string[];
  predictedDowntime: number;
}

export class AISchedulingService {
  static async predictCancellations(date: Date): Promise<CancellationPrediction[]> {
    // AI predicts which appointments are likely to be cancelled
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockAppointments = [
      {
        appointmentId: '1',
        patientId: 'patient-1',
        probability: 0.75,
        riskFactors: ['No-show history', 'Weather conditions', 'Last-minute booking'],
        suggestedActions: ['Call to confirm', 'Send reminder SMS', 'Offer teledentistry option'],
        alternativePatients: ['patient-5', 'patient-8'],
        confidence: 0.88
      },
      {
        appointmentId: '2',
        patientId: 'patient-2',
        probability: 0.45,
        riskFactors: ['First-time patient', 'Early morning appointment'],
        suggestedActions: ['Send confirmation email', 'Provide clear directions'],
        alternativePatients: ['patient-6'],
        confidence: 0.72
      }
    ];

    return mockAppointments;
  }

  static async optimizeSchedule(date: Date, constraints: {
    chairCount: number;
    operatingHours: { start: string; end: string };
    staffAvailability: any[];
  }): Promise<ScheduleOptimization> {
    // AI optimizes daily schedule for maximum efficiency
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return {
      currentEfficiency: 0.72,
      optimizedSchedule: [
        {
          time: '09:00',
          patientId: 'patient-1',
          treatmentType: 'Cleaning',
          duration: 60,
          chairNumber: 1
        },
        {
          time: '09:00',
          patientId: 'patient-2',
          treatmentType: 'Filling',
          duration: 90,
          chairNumber: 2
        },
        {
          time: '10:00',
          patientId: 'patient-3',
          treatmentType: 'Exam',
          duration: 30,
          chairNumber: 1
        }
      ],
      improvementPotential: 0.15,
      recommendations: [
        'Move cleaning appointments to morning slots',
        'Group similar procedures together',
        'Leave buffer time for emergencies'
      ],
      gapsFilled: 3
    };
  }

  static async suggestFillIns(timeSlot: { start: Date; end: Date; chairId: string }): Promise<{
    suggestedPatients: Array<{
      patientId: string;
      patientName: string;
      treatmentType: string;
      priority: 'high' | 'medium' | 'low';
      reason: string;
      availabilityConfidence: number;
    }>;
  }> {
    // AI suggests patients to fill cancelled slots
    return {
      suggestedPatients: [
        {
          patientId: 'patient-7',
          patientName: 'Jane Smith',
          treatmentType: 'Cleaning',
          priority: 'high',
          reason: 'Overdue for 6-month cleaning',
          availabilityConfidence: 0.85
        },
        {
          patientId: 'patient-8',
          patientName: 'Bob Johnson',
          treatmentType: 'Follow-up',
          priority: 'medium',
          reason: 'Flexible schedule, quick appointment',
          availabilityConfidence: 0.92
        }
      ]
    };
  }

  static async analyzeChairUtilization(date: Date): Promise<ChairUtilization[]> {
    // AI analyzes chair utilization patterns
    const chairs = [1, 2, 3, 4, 5];
    
    return chairs.map(chairId => ({
      chairId: chairId.toString(),
      utilization: Math.random() * 0.4 + 0.6, // 60-100%
      peakHours: ['09:00-11:00', '14:00-16:00'],
      suggestions: [
        chairId === 1 ? 'Consider booking longer procedures here' : 'Good for quick appointments',
        'Block time for emergency slots'
      ],
      predictedDowntime: Math.floor(Math.random() * 60) // minutes
    }));
  }

  static async detectSchedulingPatterns(): Promise<{
    peakDays: string[];
    slowPeriods: string[];
    popularTreatments: Array<{ treatment: string; frequency: number }>;
    patientPreferences: Array<{ preference: string; percentage: number }>;
    recommendations: string[];
  }> {
    // AI detects scheduling patterns and preferences
    return {
      peakDays: ['Tuesday', 'Wednesday', 'Saturday morning'],
      slowPeriods: ['Monday morning', 'Friday afternoon'],
      popularTreatments: [
        { treatment: 'Cleaning', frequency: 45 },
        { treatment: 'Filling', frequency: 25 },
        { treatment: 'Crown', frequency: 15 }
      ],
      patientPreferences: [
        { preference: 'Morning appointments', percentage: 60 },
        { preference: 'Same-day confirmation', percentage: 35 },
        { preference: 'Weekend availability', percentage: 25 }
      ],
      recommendations: [
        'Offer incentives for slow periods',
        'Block popular time slots for high-value treatments',
        'Implement waitlist for peak times'
      ]
    };
  }

  static async autoScheduleSuggestion(patientId: string, treatmentType: string): Promise<{
    suggestedSlots: Array<{
      date: Date;
      time: string;
      chairId: string;
      confidence: number;
      reasoning: string;
    }>;
    bestMatch: {
      date: Date;
      time: string;
      score: number;
      factors: string[];
    };
  }> {
    // AI suggests optimal scheduling based on patient preferences and availability
    const now = new Date();
    const suggestedSlots = [];
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      suggestedSlots.push({
        date,
        time: '10:00',
        chairId: '1',
        confidence: Math.random() * 0.3 + 0.7,
        reasoning: 'Patient prefers morning appointments, good availability'
      });
    }

    return {
      suggestedSlots,
      bestMatch: {
        date: suggestedSlots[2].date,
        time: '10:00',
        score: 0.95,
        factors: ['Patient availability', 'Chair optimization', 'Staff preference']
      }
    };
  }
}