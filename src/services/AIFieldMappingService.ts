interface FieldMappingSuggestion {
  sourceField: string;
  targetField: string;
  confidence: number;
  reason: string;
}

interface AIFieldMappingResult {
  suggestions: FieldMappingSuggestion[];
  unmatchedSourceFields: string[];
  unmatchedTargetFields: string[];
}

export class AIFieldMappingService {
  private static readonly FIELD_SYNONYMS: Record<string, string[]> = {
    'first_name': ['first', 'fname', 'firstname', 'given_name', 'forename', 'name_first'],
    'last_name': ['last', 'lname', 'lastname', 'family_name', 'surname', 'name_last'],
    'email': ['email_address', 'e_mail', 'mail', 'contact_email', 'email_addr'],
    'phone': ['telephone', 'tel', 'mobile', 'cell', 'contact_phone', 'phone_number', 'phone_no'],
    'date_of_birth': ['dob', 'birth_date', 'birthdate', 'birth', 'date_birth', 'patient_dob'],
    'address': ['addr', 'street', 'home_address', 'mailing_address', 'street_address'],
    'patient_id': ['patient', 'pat_id', 'patient_number', 'chart_number', 'chart_id'],
    'appointment_date': ['appt_date', 'appointment_time', 'visit_date', 'scheduled_date', 'date_time'],
    'dentist_id': ['doctor_id', 'provider_id', 'dentist', 'doctor', 'provider'],
    'treatment_type': ['procedure', 'service', 'treatment', 'procedure_code', 'service_type'],
    'total': ['amount', 'cost', 'price', 'fee', 'charge', 'bill_amount'],
    'status': ['state', 'condition', 'current_status', 'record_status'],
    'notes': ['comments', 'remarks', 'description', 'memo', 'additional_info']
  };

  private static readonly PATTERN_MATCHERS: Array<{
    pattern: RegExp;
    targetField: string;
    confidence: number;
  }> = [
    { pattern: /^(first|given).*name$/i, targetField: 'first_name', confidence: 0.9 },
    { pattern: /^(last|family|sur).*name$/i, targetField: 'last_name', confidence: 0.9 },
    { pattern: /^e?mail/i, targetField: 'email', confidence: 0.95 },
    { pattern: /^(phone|tel|mobile|cell)/i, targetField: 'phone', confidence: 0.9 },
    { pattern: /^(dob|birth.*date|date.*birth)/i, targetField: 'date_of_birth', confidence: 0.95 },
    { pattern: /^(addr|address|street)/i, targetField: 'address', confidence: 0.85 },
    { pattern: /^(pat|patient).*id/i, targetField: 'patient_id', confidence: 0.9 },
    { pattern: /^(appt|appointment).*date/i, targetField: 'appointment_date', confidence: 0.9 },
    { pattern: /^(dr|doctor|dentist|provider)/i, targetField: 'dentist_id', confidence: 0.8 },
    { pattern: /^(amount|total|cost|fee|charge)/i, targetField: 'total', confidence: 0.85 },
    { pattern: /^(note|comment|remark|desc)/i, targetField: 'notes', confidence: 0.8 }
  ];

  /**
   * Analyzes source fields and suggests mappings to target fields using AI-like logic
   */
  static suggestFieldMappings(
    sourceFields: string[],
    targetFields: string[],
    tableType: string
  ): AIFieldMappingResult {
    const suggestions: FieldMappingSuggestion[] = [];
    const usedSourceFields = new Set<string>();
    const usedTargetFields = new Set<string>();

    // First pass: Exact matches
    for (const targetField of targetFields) {
      const exactMatch = sourceFields.find(sf => 
        sf.toLowerCase() === targetField.toLowerCase()
      );
      
      if (exactMatch && !usedSourceFields.has(exactMatch)) {
        suggestions.push({
          sourceField: exactMatch,
          targetField,
          confidence: 1.0,
          reason: 'Exact field name match'
        });
        usedSourceFields.add(exactMatch);
        usedTargetFields.add(targetField);
      }
    }

    // Second pass: Synonym matching
    for (const targetField of targetFields) {
      if (usedTargetFields.has(targetField)) continue;

      const synonyms = this.FIELD_SYNONYMS[targetField] || [];
      for (const synonym of synonyms) {
        const synonymMatch = sourceFields.find(sf => 
          sf.toLowerCase() === synonym.toLowerCase() && !usedSourceFields.has(sf)
        );
        
        if (synonymMatch) {
          suggestions.push({
            sourceField: synonymMatch,
            targetField,
            confidence: 0.9,
            reason: `Synonym match: "${synonymMatch}" → "${targetField}"`
          });
          usedSourceFields.add(synonymMatch);
          usedTargetFields.add(targetField);
          break;
        }
      }
    }

    // Third pass: Pattern matching
    for (const targetField of targetFields) {
      if (usedTargetFields.has(targetField)) continue;

      for (const matcher of this.PATTERN_MATCHERS) {
        if (matcher.targetField === targetField) {
          const patternMatch = sourceFields.find(sf => 
            matcher.pattern.test(sf) && !usedSourceFields.has(sf)
          );
          
          if (patternMatch) {
            suggestions.push({
              sourceField: patternMatch,
              targetField,
              confidence: matcher.confidence,
              reason: `Pattern match: "${patternMatch}" matches ${targetField} pattern`
            });
            usedSourceFields.add(patternMatch);
            usedTargetFields.add(targetField);
            break;
          }
        }
      }
    }

    // Fourth pass: Fuzzy matching
    for (const targetField of targetFields) {
      if (usedTargetFields.has(targetField)) continue;

      let bestMatch: { field: string; score: number } | null = null;

      for (const sourceField of sourceFields) {
        if (usedSourceFields.has(sourceField)) continue;

        const score = this.calculateSimilarity(sourceField, targetField);
        if (score > 0.6 && (!bestMatch || score > bestMatch.score)) {
          bestMatch = { field: sourceField, score };
        }
      }

      if (bestMatch && bestMatch.score > 0.6) {
        suggestions.push({
          sourceField: bestMatch.field,
          targetField,
          confidence: bestMatch.score * 0.7, // Reduce confidence for fuzzy matches
          reason: `Fuzzy match: "${bestMatch.field}" similar to "${targetField}" (${Math.round(bestMatch.score * 100)}% similarity)`
        });
        usedSourceFields.add(bestMatch.field);
        usedTargetFields.add(targetField);
      }
    }

    // Table-specific smart mapping
    this.applyTableSpecificRules(sourceFields, targetFields, tableType, suggestions, usedSourceFields, usedTargetFields);

    const unmatchedSourceFields = sourceFields.filter(sf => !usedSourceFields.has(sf));
    const unmatchedTargetFields = targetFields.filter(tf => !usedTargetFields.has(tf));

    return {
      suggestions,
      unmatchedSourceFields,
      unmatchedTargetFields
    };
  }

  private static calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();

    // Levenshtein distance
    const matrix = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));

    for (let i = 0; i <= s1.length; i++) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= s2.length; j++) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= s2.length; j++) {
      for (let i = 1; i <= s1.length; i++) {
        const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    const distance = matrix[s2.length][s1.length];
    const maxLength = Math.max(s1.length, s2.length);
    return 1 - distance / maxLength;
  }

  private static applyTableSpecificRules(
    sourceFields: string[],
    targetFields: string[],
    tableType: string,
    suggestions: FieldMappingSuggestion[],
    usedSourceFields: Set<string>,
    usedTargetFields: Set<string>
  ): void {
    switch (tableType) {
      case 'patients':
        this.applyPatientsRules(sourceFields, suggestions, usedSourceFields, usedTargetFields);
        break;
      case 'appointments':
        this.applyAppointmentsRules(sourceFields, suggestions, usedSourceFields, usedTargetFields);
        break;
      case 'medical_records':
        this.applyMedicalRecordsRules(sourceFields, suggestions, usedSourceFields, usedTargetFields);
        break;
      case 'invoices':
        this.applyInvoicesRules(sourceFields, suggestions, usedSourceFields, usedTargetFields);
        break;
    }
  }

  private static applyPatientsRules(
    sourceFields: string[],
    suggestions: FieldMappingSuggestion[],
    usedSourceFields: Set<string>,
    usedTargetFields: Set<string>
  ): void {
    // Look for gender fields
    if (!usedTargetFields.has('gender')) {
      const genderField = sourceFields.find(sf => 
        /^(gender|sex)$/i.test(sf) && !usedSourceFields.has(sf)
      );
      if (genderField) {
        suggestions.push({
          sourceField: genderField,
          targetField: 'gender',
          confidence: 0.95,
          reason: 'Patient demographic field match'
        });
        usedSourceFields.add(genderField);
        usedTargetFields.add('gender');
      }
    }

    // Look for emergency contact
    if (!usedTargetFields.has('emergency_contact')) {
      const emergencyField = sourceFields.find(sf => 
        /emergency.*contact/i.test(sf) && !usedSourceFields.has(sf)
      );
      if (emergencyField) {
        suggestions.push({
          sourceField: emergencyField,
          targetField: 'emergency_contact',
          confidence: 0.9,
          reason: 'Emergency contact field match'
        });
        usedSourceFields.add(emergencyField);
        usedTargetFields.add('emergency_contact');
      }
    }
  }

  private static applyAppointmentsRules(
    sourceFields: string[],
    suggestions: FieldMappingSuggestion[],
    usedSourceFields: Set<string>,
    usedTargetFields: Set<string>
  ): void {
    // Look for duration fields
    if (!usedTargetFields.has('duration')) {
      const durationField = sourceFields.find(sf => 
        /^(duration|length|time)$/i.test(sf) && !usedSourceFields.has(sf)
      );
      if (durationField) {
        suggestions.push({
          sourceField: durationField,
          targetField: 'duration',
          confidence: 0.85,
          reason: 'Appointment duration field match'
        });
        usedSourceFields.add(durationField);
        usedTargetFields.add('duration');
      }
    }
  }

  private static applyMedicalRecordsRules(
    sourceFields: string[],
    suggestions: FieldMappingSuggestion[],
    usedSourceFields: Set<string>,
    usedTargetFields: Set<string>
  ): void {
    // Look for diagnosis fields
    if (!usedTargetFields.has('diagnosis')) {
      const diagnosisField = sourceFields.find(sf => 
        /^(diagnosis|dx|diagnostic)$/i.test(sf) && !usedSourceFields.has(sf)
      );
      if (diagnosisField) {
        suggestions.push({
          sourceField: diagnosisField,
          targetField: 'diagnosis',
          confidence: 0.9,
          reason: 'Medical diagnosis field match'
        });
        usedSourceFields.add(diagnosisField);
        usedTargetFields.add('diagnosis');
      }
    }

    // Look for treatment fields
    if (!usedTargetFields.has('treatment')) {
      const treatmentField = sourceFields.find(sf => 
        /^(treatment|tx|therapy)$/i.test(sf) && !usedSourceFields.has(sf)
      );
      if (treatmentField) {
        suggestions.push({
          sourceField: treatmentField,
          targetField: 'treatment',
          confidence: 0.9,
          reason: 'Medical treatment field match'
        });
        usedSourceFields.add(treatmentField);
        usedTargetFields.add('treatment');
      }
    }
  }

  private static applyInvoicesRules(
    sourceFields: string[],
    suggestions: FieldMappingSuggestion[],
    usedSourceFields: Set<string>,
    usedTargetFields: Set<string>
  ): void {
    // Look for subtotal and tax fields
    if (!usedTargetFields.has('subtotal')) {
      const subtotalField = sourceFields.find(sf => 
        /^(subtotal|sub_total|net_amount)$/i.test(sf) && !usedSourceFields.has(sf)
      );
      if (subtotalField) {
        suggestions.push({
          sourceField: subtotalField,
          targetField: 'subtotal',
          confidence: 0.9,
          reason: 'Invoice subtotal field match'
        });
        usedSourceFields.add(subtotalField);
        usedTargetFields.add('subtotal');
      }
    }

    if (!usedTargetFields.has('tax')) {
      const taxField = sourceFields.find(sf => 
        /^(tax|vat|gst|sales_tax)$/i.test(sf) && !usedSourceFields.has(sf)
      );
      if (taxField) {
        suggestions.push({
          sourceField: taxField,
          targetField: 'tax',
          confidence: 0.9,
          reason: 'Invoice tax field match'
        });
        usedSourceFields.add(taxField);
        usedTargetFields.add('tax');
      }
    }
  }
}