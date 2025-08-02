interface CompetitorData {
  practiceName: string;
  distance: number; // miles from practice
  rating: number;
  treatmentFees: { [treatmentCode: string]: number };
  specialties: string[];
  lastUpdated: Date;
}

interface FeeAnalysis {
  treatmentCode: string;
  treatmentName: string;
  currentFee: number;
  marketAverage: number;
  marketHigh: number;
  marketLow: number;
  recommendedFee: number;
  positionInMarket: 'below_average' | 'average' | 'above_average' | 'premium';
  revenueImpact: number;
  competitiveAdvantage: string;
  recommendations: string[];
}

interface MarketAnalysis {
  totalCompetitorsAnalyzed: number;
  averageMarketRating: number;
  pricePositioning: 'budget' | 'mid_market' | 'premium';
  opportunityScore: number;
  topRecommendations: string[];
  feeAnalyses: FeeAnalysis[];
}

export class CompetitiveFeeAnalyzerService {
  static async analyzeMarketFees(location: string = 'Default City'): Promise<MarketAnalysis> {
    // Simulate competitive analysis
    await new Promise(resolve => setTimeout(resolve, 2000));

    const competitors: CompetitorData[] = [
      {
        practiceName: 'Smile Center Plus',
        distance: 1.2,
        rating: 4.5,
        treatmentFees: {
          'D0150': 85,   // Comprehensive exam
          'D0210': 140,  // Intraoral X-rays
          'D1110': 95,   // Prophylaxis
          'D2391': 165,  // Composite filling
          'D2750': 1200, // Crown
          'D7140': 225   // Extraction
        },
        specialties: ['General', 'Cosmetic'],
        lastUpdated: new Date('2024-01-15')
      },
      {
        practiceName: 'Elite Dental Group',
        distance: 2.1,
        rating: 4.8,
        treatmentFees: {
          'D0150': 110,
          'D0210': 160,
          'D1110': 120,
          'D2391': 195,
          'D2750': 1450,
          'D7140': 275
        },
        specialties: ['General', 'Orthodontics', 'Implants'],
        lastUpdated: new Date('2024-01-20')
      },
      {
        practiceName: 'Family Dentistry',
        distance: 0.8,
        rating: 4.2,
        treatmentFees: {
          'D0150': 75,
          'D0210': 120,
          'D1110': 85,
          'D2391': 145,
          'D2750': 1100,
          'D7140': 200
        },
        specialties: ['General', 'Pediatric'],
        lastUpdated: new Date('2024-01-18')
      }
    ];

    const currentFees = {
      'D0150': 95,   // Your current fees
      'D0210': 150,
      'D1110': 105,
      'D2391': 175,
      'D2750': 1300,
      'D7140': 250
    };

    const treatmentNames = {
      'D0150': 'Comprehensive Oral Examination',
      'D0210': 'Intraoral X-rays',
      'D1110': 'Prophylaxis (Cleaning)',
      'D2391': 'Composite Filling',
      'D2750': 'Crown',
      'D7140': 'Tooth Extraction'
    };

    const analyses: FeeAnalysis[] = Object.keys(currentFees).map(code => {
      const competitorFees = competitors.map(c => c.treatmentFees[code]).filter(fee => fee);
      const marketAverage = competitorFees.reduce((sum, fee) => sum + fee, 0) / competitorFees.length;
      const marketHigh = Math.max(...competitorFees);
      const marketLow = Math.min(...competitorFees);
      const currentFee = currentFees[code];
      
      let positionInMarket: 'below_average' | 'average' | 'above_average' | 'premium';
      if (currentFee < marketAverage * 0.9) positionInMarket = 'below_average';
      else if (currentFee > marketAverage * 1.2) positionInMarket = 'premium';
      else if (currentFee > marketAverage * 1.05) positionInMarket = 'above_average';
      else positionInMarket = 'average';

      const recommendedFee = Math.round(marketAverage * 1.05); // Slightly above average
      const revenueImpact = (recommendedFee - currentFee) * this.estimateAnnualVolume(code);

      return {
        treatmentCode: code,
        treatmentName: treatmentNames[code],
        currentFee,
        marketAverage: Math.round(marketAverage),
        marketHigh,
        marketLow,
        recommendedFee,
        positionInMarket,
        revenueImpact,
        competitiveAdvantage: this.getCompetitiveAdvantage(positionInMarket, code),
        recommendations: this.getFeeRecommendations(positionInMarket, code, currentFee, marketAverage)
      };
    });

    return {
      totalCompetitorsAnalyzed: competitors.length,
      averageMarketRating: 4.5,
      pricePositioning: 'mid_market',
      opportunityScore: 0.78,
      topRecommendations: [
        'Consider 8% increase on composite fillings to align with market',
        'Crown pricing is competitive - maintain current rates',
        'Opportunity to increase prophylaxis fees by $10-15',
        'Review premium service offerings to justify higher rates'
      ],
      feeAnalyses: analyses
    };
  }

  private static estimateAnnualVolume(treatmentCode: string): number {
    const volumes = {
      'D0150': 800,  // New patient exams per year
      'D0210': 1200, // X-rays
      'D1110': 2000, // Cleanings
      'D2391': 450,  // Fillings
      'D2750': 120,  // Crowns
      'D7140': 180   // Extractions
    };
    return volumes[treatmentCode] || 100;
  }

  private static getCompetitiveAdvantage(position: string, code: string): string {
    const advantages = {
      'below_average': 'Cost-effective option for price-sensitive patients',
      'average': 'Competitive pricing with market standards',
      'above_average': 'Premium positioning with perceived higher quality',
      'premium': 'Luxury service positioning'
    };
    return advantages[position];
  }

  private static getFeeRecommendations(position: string, code: string, current: number, average: number): string[] {
    const baseRecs = [];
    
    if (position === 'below_average') {
      baseRecs.push('Consider gradual fee increase to market average');
      baseRecs.push('Emphasize value-added services to justify higher fees');
    } else if (position === 'premium') {
      baseRecs.push('Ensure service quality matches premium pricing');
      baseRecs.push('Consider luxury amenities to support pricing');
    } else {
      baseRecs.push('Maintain competitive positioning');
      baseRecs.push('Monitor market changes quarterly');
    }

    return baseRecs;
  }

  static async trackCompetitorChanges(): Promise<{
    recentChanges: Array<{
      competitor: string;
      treatment: string;
      oldFee: number;
      newFee: number;
      changePercent: number;
      date: Date;
    }>;
    marketTrends: string[];
  }> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      recentChanges: [
        {
          competitor: 'Elite Dental Group',
          treatment: 'Crown',
          oldFee: 1350,
          newFee: 1450,
          changePercent: 7.4,
          date: new Date('2024-01-15')
        },
        {
          competitor: 'Smile Center Plus',
          treatment: 'Cleaning',
          oldFee: 90,
          newFee: 95,
          changePercent: 5.6,
          date: new Date('2024-01-20')
        }
      ],
      marketTrends: [
        'Overall market fees increased 3.2% in the last quarter',
        'Cosmetic treatments showing higher price tolerance',
        'Insurance reimbursement rates remain stable',
        'Premium practices gaining market share'
      ]
    };
  }
}