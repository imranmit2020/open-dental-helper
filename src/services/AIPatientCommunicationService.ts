export interface PatientCommunication {
  id: string;
  patientId: string;
  type: 'recall' | 'appointment_reminder' | 'follow_up' | 'treatment_plan' | 'payment_reminder';
  channel: 'sms' | 'email' | 'voice' | 'chat';
  message: string;
  scheduledFor: Date;
  status: 'scheduled' | 'sent' | 'delivered' | 'failed' | 'responded';
  aiGenerated: boolean;
  sentAt?: Date;
  response?: string;
}

export interface RecallPrediction {
  patientId: string;
  lastVisit: Date;
  nextDueDate: Date;
  riskLevel: 'low' | 'medium' | 'high';
  likelihood: number; // 0-1 probability of scheduling
  suggestedMessage: string;
  preferredChannel: 'sms' | 'email' | 'voice';
  bestTimeToContact: string;
}

export class AIPatientCommunicationService {
  static async generateRecallMessage(patientId: string, patientName: string, lastVisit: Date): Promise<string> {
    const daysSinceVisit = Math.floor((Date.now() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));
    
    const templates = [
      `Hi ${patientName}! It's been ${Math.floor(daysSinceVisit / 30)} months since your last cleaning. Time for your next appointment! Reply to schedule or call us at (555) 123-4567. 😊`,
      `Hello ${patientName}, your dental health is important to us! You're due for your regular checkup. Click here to book online or call us. We have flexible scheduling!`,
      `${patientName}, we miss seeing your smile! It's time for your 6-month checkup. Book now and get 10% off teeth whitening. Call (555) 123-4567!`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }

  static async predictRecallSuccess(patientId: string): Promise<RecallPrediction> {
    // AI predicts recall success based on patient history
    const mockData: RecallPrediction = {
      patientId,
      lastVisit: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 6 months ago
      nextDueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      riskLevel: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low',
      likelihood: Math.random() * 0.4 + 0.6, // 60-100%
      suggestedMessage: '',
      preferredChannel: Math.random() > 0.5 ? 'sms' : 'email',
      bestTimeToContact: Math.random() > 0.5 ? 'morning' : 'afternoon'
    };

    mockData.suggestedMessage = await this.generateRecallMessage(patientId, 'Patient', mockData.lastVisit);
    return mockData;
  }

  static async sendSmartFollowUp(patientId: string, appointmentType: string): Promise<PatientCommunication> {
    const messages = {
      'cleaning': "How are you feeling after your cleaning? Any sensitivity? Don't forget to use the fluoride rinse we provided!",
      'filling': "Your filling should feel normal now. If you experience any discomfort, please call us. Avoid hard foods for 24 hours.",
      'crown': "Your new crown looks great! It may feel different for a few days. Call if you have any concerns.",
      'extraction': "Rest and follow the post-op instructions. Use the prescribed pain medication as needed. Call if bleeding persists."
    };

    return {
      id: crypto.randomUUID(),
      patientId,
      type: 'follow_up',
      channel: 'sms',
      message: messages[appointmentType as keyof typeof messages] || "Thank you for your visit! Please call if you have any questions.",
      scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours later
      status: 'scheduled',
      aiGenerated: true
    };
  }

  static async generateAppointmentReminder(patientId: string, appointmentDate: Date): Promise<string> {
    const daysBefore = Math.floor((appointmentDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    if (daysBefore === 1) {
      return `Reminder: You have a dental appointment tomorrow at ${appointmentDate.toLocaleTimeString()}. Reply CONFIRM or call to reschedule.`;
    } else if (daysBefore === 7) {
      return `Your dental appointment is in one week. We're looking forward to seeing you! Reply if you need to reschedule.`;
    } else {
      return `Appointment reminder: ${appointmentDate.toLocaleDateString()} at ${appointmentDate.toLocaleTimeString()}. See you soon!`;
    }
  }

  static async detectCommunicationSentiment(message: string): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    urgency: 'low' | 'medium' | 'high';
    suggestedResponse?: string;
  }> {
    // AI sentiment analysis
    const sentiment = Math.random() > 0.7 ? 'negative' : Math.random() > 0.3 ? 'positive' : 'neutral';
    const urgency = message.toLowerCase().includes('pain') || message.toLowerCase().includes('emergency') ? 'high' : 'low';
    
    return {
      sentiment,
      confidence: Math.random() * 0.3 + 0.7,
      urgency,
      suggestedResponse: sentiment === 'negative' ? "I understand your concern. Let me connect you with someone who can help right away." : undefined
    };
  }
}