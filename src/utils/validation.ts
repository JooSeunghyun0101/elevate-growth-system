import { CONSTANTS } from '@/types';

// 피드백 검증 관련 함수들
export const feedbackValidation = {
  // 기본 길이 검증
  checkLength: (feedback: string): boolean => {
    return feedback.trim().length >= CONSTANTS.MIN_FEEDBACK_LENGTH;
  },

  // 문장 수 검증
  checkSentenceCount: (feedback: string): boolean => {
    const sentences = feedback.split(/[.!?다요]\s*/).filter(s => s.trim().length > 0);
    return sentences.length >= CONSTANTS.MIN_FEEDBACK_SENTENCES;
  },

  // 의미없는 내용 감지
  detectMeaninglessContent: (feedback: string): { isValid: boolean; reason?: string } => {
    const text = feedback.trim();
    
    // 1. 연속된 같은 문자 감지 (3개 이상)
    const repeatedCharPattern = /(.)\1{2,}/g;
    const repeatedMatches = text.match(repeatedCharPattern);
    if (repeatedMatches && repeatedMatches.some(match => match.length >= 5)) {
      return { isValid: false, reason: '의미없는 문자 반복이 감지되었습니다 (예: "ㅋㅋㅋㅋㅋ", ".....", "!!!!")' };
    }

    // 2. 지나친 공백 사용 감지
    const excessiveSpaces = /\s{5,}/g;
    if (excessiveSpaces.test(text)) {
      return { isValid: false, reason: '문장을 늘리기 위한 과도한 공백 사용이 감지되었습니다' };
    }

    // 3. 의미없는 문자 나열 감지
    if (text.includes('.....') || text.includes('!!!!!')) {
      return { isValid: false, reason: '의미없는 특수문자 반복이 감지되었습니다' };
    }
    
    // 자음만 5개 이상 연속 (개별 검사)
    const consonants = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
    let consonantCount = 0;
    for (const char of text) {
      if (consonants.includes(char)) {
        consonantCount++;
        if (consonantCount >= 5) {
          return { isValid: false, reason: '의미없는 자음 나열이 감지되었습니다' };
        }
      } else {
        consonantCount = 0;
      }
    }
    
    // 감정표현 반복 (ㅋㅋㅋ, ㅎㅎㅎ 등)
    if (/ㅋ{3,}|ㅎ{3,}|ㅜ{3,}|ㅠ{3,}/.test(text)) {
      return { isValid: false, reason: '의미없는 감정표현 반복이 감지되었습니다' };
    }

    // 4. 단순 반복 문장 감지
    const sentences = text.split(/[.!?]/);
    const uniqueSentences = new Set(sentences.map(s => s.trim().toLowerCase()));
    if (sentences.length > 3 && uniqueSentences.size < sentences.length * 0.7) {
      return { isValid: false, reason: '단순 반복 문장이 감지되었습니다' };
    }

    return { isValid: true };
  },

  // 일반적인 피드백 감지
  detectGenericFeedback: (feedback: string): { isGeneric: boolean; reason?: string } => {
    const text = feedback.trim();
    
    // 1. 기본적인 일반적 표현 패턴 검사
    const genericPatterns = [
      /^(좋았습니다?|잘했습니다?|수고했습니다?|고생했습니다?)\.?$/i,
      /^(열심히\s*했습니다?|성실했습니다?|적극적이었습니다?)\.?$/i,
      /^(계속\s*이런\s*식으로\s*해주세요|앞으로도\s*잘\s*부탁드립니다?)\.?$/i,
      /^(만족스럽습니다?|괜찮습니다?|무난합니다?)\.?$/i
    ];

    for (const pattern of genericPatterns) {
      if (pattern.test(text)) {
        return { isGeneric: true, reason: '구체적이지 않은 일반적인 표현입니다. 구체적인 성과나 개선점을 언급해주세요.' };
      }
    }

    // 2. 길이는 충분하지만 의미 없는 반복
    const words = text.split(/\s+/);
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    if (words.length >= 10 && uniqueWords.size < words.length * 0.6) {
      return { isGeneric: true, reason: '단어가 과도하게 반복되어 구체성이 부족합니다.' };
    }

    return { isGeneric: false };
  },

  // 종합 검증
  validateFeedback: (feedback: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!feedback || !feedback.trim()) {
      errors.push('피드백을 입력해주세요.');
      return { isValid: false, errors };
    }

    // 길이 검증
    if (!feedbackValidation.checkLength(feedback)) {
      errors.push(`피드백이 너무 짧습니다. 최소 ${CONSTANTS.MIN_FEEDBACK_LENGTH}자 이상 작성해주세요.`);
    }

    // 문장 수 검증
    if (!feedbackValidation.checkSentenceCount(feedback)) {
      errors.push(`피드백이 너무 단순합니다. 최소 ${CONSTANTS.MIN_FEEDBACK_SENTENCES}문장 이상 작성해주세요.`);
    }

    // 의미없는 내용 검증
    const meaningfulnessCheck = feedbackValidation.detectMeaninglessContent(feedback);
    if (!meaningfulnessCheck.isValid) {
      errors.push(meaningfulnessCheck.reason || '부적절한 내용이 감지되었습니다.');
    }

    // 일반적인 피드백 검증
    const genericCheck = feedbackValidation.detectGenericFeedback(feedback);
    if (genericCheck.isGeneric) {
      errors.push(genericCheck.reason || '구체성이 부족한 피드백입니다.');
    }

    return { isValid: errors.length === 0, errors };
  }
};

// 가중치 검증
export const weightValidation = {
  // 총 가중치가 100%인지 확인
  checkTotalWeight: (weights: number[]): boolean => {
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    return total === CONSTANTS.TOTAL_WEIGHT;
  },

  // 가중치 범위 검증 (0-100)
  checkWeightRange: (weight: number): boolean => {
    return weight >= 0 && weight <= CONSTANTS.TOTAL_WEIGHT;
  },

  // 가중치 검증 (종합)
  validateWeights: (weights: number[]): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // 개별 가중치 범위 검증
    weights.forEach((weight, index) => {
      if (!weightValidation.checkWeightRange(weight)) {
        errors.push(`과업 ${index + 1}: 가중치는 0-100 사이여야 합니다.`);
      }
    });

    // 총 가중치 검증
    if (!weightValidation.checkTotalWeight(weights)) {
      const total = weights.reduce((sum, weight) => sum + weight, 0);
      errors.push(`가중치 합계가 ${CONSTANTS.TOTAL_WEIGHT}%가 아닙니다. 현재: ${total}%`);
    }

    return { isValid: errors.length === 0, errors };
  }
};

// 날짜 검증
export const dateValidation = {
  // 날짜 형식 검증 (YYYY-MM-DD)
  isValidDateFormat: (date: string): boolean => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;
    
    const dateObj = new Date(date);
    return dateObj instanceof Date && !isNaN(dateObj.getTime());
  },

  // 시작일이 종료일보다 이전인지 확인
  isStartDateBeforeEndDate: (startDate: string, endDate: string): boolean => {
    return new Date(startDate) <= new Date(endDate);
  },

  // 날짜 범위 검증
  validateDateRange: (startDate: string, endDate: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!dateValidation.isValidDateFormat(startDate)) {
      errors.push('시작일 형식이 올바르지 않습니다. (YYYY-MM-DD)');
    }

    if (!dateValidation.isValidDateFormat(endDate)) {
      errors.push('종료일 형식이 올바르지 않습니다. (YYYY-MM-DD)');
    }

    if (dateValidation.isValidDateFormat(startDate) && dateValidation.isValidDateFormat(endDate)) {
      if (!dateValidation.isStartDateBeforeEndDate(startDate, endDate)) {
        errors.push('시작일은 종료일보다 이전이어야 합니다.');
      }
    }

    return { isValid: errors.length === 0, errors };
  }
}; 