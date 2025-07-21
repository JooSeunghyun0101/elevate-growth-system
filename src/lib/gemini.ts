// Gemini API 호출 유틸리티
// Google의 Gemini AI 모델을 사용한 피드백 어시스턴트

const GEMINI_API_KEY = 'AIzaSyDvwOigpmSI_PVILeeRUnzCJPbcfaH8ztY';
const GEMINI_MODEL = 'gemini-1.5-flash'; // 최신 Gemini 모델 사용
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface FeedbackSuggestion {
  type: 'recommendation' | 'correction' | 'warning' | 'improvement';
  content: string;
  explanation?: string;
}

// 사용 가능한 Gemini 모델들 (우선순위 순) - 안정적인 모델로 업데이트
const GEMINI_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-1.0-pro',
  'gemini-pro'
];

// 평가가이드 지식 베이스
const EVALUATION_GUIDE_KNOWLEDGE = `
**수시 성과관리체계 가이드라인:**

**평가 철학:**
- 지속적 모니터링: 과업 진행 상황을 실시간으로 추적하고 관리
- 정기적 피드백: 수시 성과보고를 통한 양방향 소통과 개선점 도출
- 적응적 목표 조정: 변화하는 환경에 맞춰 과업과 목표를 유연하게 조정
- 성장 중심 평가: 결과뿐만 아니라 과정과 학습을 중시하는 발전적 평가

**점수 의미:**
- 평가점수는 성장레벨별 요구수준을 의미
- 성장레벨보다 평가점수가 같거나 높으면 달성
- 1점: 미흡, 2점: 보통, 3점: 양호, 4점: 우수

**기여방식:**
- 총괄: 업무 전체를 책임지고 관리, 프로젝트 전체적인 방향 설정
- 리딩: 특정 영역을 주도적으로 담당, 해당 영역의 성과에 직접 책임
- 실무: 핵심 업무를 직접 수행, 업무의 질적 완성도에 기여
- 지원: 다른 구성원을 보조하고 지원, 주 담당자를 보조

**기여범위:**
- 전략적: 조직 전체에 영향, 부서를 넘어 조직 전체의 방향성이나 성과에 영향
- 상호적: 팀 단위 협업, 팀 내 다른 구성원들과 긴밀히 협력하여 공동 목표 달성
- 독립적: 자율적 업무 수행, 개인의 판단과 책임 하에 독립적으로 업무를 기획하고 실행
- 의존적: 지시받은 업무 수행, 상급자나 동료의 지시나 가이드라인에 따라 업무 수행

**점수 매트릭스:**
- 총괄: 의존적(2점), 독립적(3점), 상호적(4점), 전략적(4점)
- 리딩: 의존적(2점), 독립적(3점), 상호적(3점), 전략적(4점)
- 실무: 의존적(1점), 독립적(2점), 상호적(3점), 전략적(3점)
- 지원: 의존적(1점), 독립적(1점), 상호적(2점), 전략적(2점)

**평가 절차:**
1. 피평가자: 과업 등록 (주요 과업과 가중치 설정)
2. 평가자: 과업 검토 (과업 목록과 가중치 확인)
3. 평가자: 기여방식 평가 (총괄/리딩/실무/지원 선택)
4. 평가자: 기여범위 평가 (전략적/상호적/독립적/의존적 선택)
5. 평가자: 피드백 작성 (구체적이고 건설적인 피드백)
6. 피평가자: 피드백 확인 및 과업 개선
`;

// Gemini API 호출 함수 (여러 모델 지원)
async function callGemini(prompt: string): Promise<string> {
  let lastError: Error | null = null;

  // 여러 모델을 순차적으로 시도
  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      
      console.log('🤖 Gemini API 호출 시도:', {
        model: model,
        promptLength: prompt.length,
        url: url
      });

      const response = await fetch(`${url}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 400, // 토큰 수를 줄여서 500자 제한 강화
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`⚠️ 모델 ${model} 실패:`, {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        lastError = new Error(`${model}: ${response.status} - ${errorText}`);
        continue; // 다음 모델 시도
      }

      const data = await response.json();
      console.log('✅ Gemini API 응답 성공:', {
        model: model,
        candidatesCount: data.candidates?.length || 0
      });

      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) {
        console.warn(`⚠️ 모델 ${model}에서 텍스트를 찾을 수 없음:`, data);
        lastError = new Error(`${model}: 응답에서 내용을 찾을 수 없음`);
        continue; // 다음 모델 시도
      }

      console.log(`🎉 모델 ${model}로 성공!`);
      
      // 500자 제한 강화 - 완전한 문장으로 끝나도록
      if (content.length > 500) {
        // 500자 지점에서 가장 가까운 문장 끝을 찾기
        const truncated = content.substring(0, 500);
        const lastSentenceEnd = Math.max(
          truncated.lastIndexOf('.'),
          truncated.lastIndexOf('다.'),
          truncated.lastIndexOf('요.'),
          truncated.lastIndexOf('습니다.'),
          truncated.lastIndexOf('다!'),
          truncated.lastIndexOf('요!'),
          truncated.lastIndexOf('습니다!')
        );
        
        if (lastSentenceEnd > 300) { // 너무 짧아지지 않도록
          return truncated.substring(0, lastSentenceEnd + 1);
        } else {
          return truncated + '...';
        }
      }
      
      return content;

    } catch (error) {
      console.warn(`⚠️ 모델 ${model} 오류:`, error);
      lastError = error instanceof Error ? error : new Error('알 수 없는 오류');
      continue; // 다음 모델 시도
    }
  }

  // 모든 모델 시도 실패
  console.error('❌ 모든 Gemini 모델 시도 실패:', lastError);
  throw new Error(`AI 서비스 연결 실패: ${lastError?.message || '모든 모델에서 실패'}`);
}

// 피드백 추천 생성 (과업 정보 기반)
export async function generateFeedbackRecommendation(
  taskTitle: string,
  taskDescription: string,
  score: number,
  contributionMethod: string,
  contributionScope: string,
  currentFeedback?: string
): Promise<string> {
  const prompt = `${EVALUATION_GUIDE_KNOWLEDGE}

위 평가가이드 내용을 바탕으로 피드백을 작성해주세요.

**피평가자가 설정한 정보:**
- 과업명: "${taskTitle}"
- 과업내용: "${taskDescription}"

**평가자가 평가한 정보:**
- 기여방식: ${contributionMethod}
- 기여범위: ${contributionScope}  
- 평가점수: ${score}점

**피드백 작성 요구사항:**
1. 반드시 평가가이드의 철학과 기준에 따라 작성
2. 기여방식과 기여범위의 정의를 정확히 반영
3. 점수 매트릭스와 점수 의미를 고려한 평가
4. 수시 성과관리체계의 관점에서 성장 중심 피드백
5. 완전한 문장으로 구성하되 **절대 500자를 넘지 않도록** 작성
6. 구체적이고 실행 가능한 개선 방안 제시

평가가이드에 기반하여 균형잡힌 피드백을 **500자 이내**로 작성해주세요.`;

  return await callGemini(prompt);
}

// 문장교정 기능 (피드백 문법 개선 및 오탈자 수정)
export async function improveFeedback(
  currentFeedback: string,
  taskTitle: string,
  score: number
): Promise<string> {
  const prompt = `당신은 문서 교정 전문가입니다.
주어진 피드백의 내용은 절대 변경하지 말고, 오직 문법과 표현만 교정해주세요.

**교정 원칙:**
1. 내용과 의미는 절대 변경하지 않음
2. 새로운 내용 추가 금지
3. 기존 내용 삭제 금지
4. 문장의 순서 변경 금지

**교정 범위:**
1. 맞춤법 및 띄어쓰기 교정만
2. 문법적 오류 수정만
3. 어색한 표현을 자연스럽게 수정만
4. 경어체 통일 (하십시오체)
5. 문장 부호 정리
6. **절대 500자를 넘지 않도록** 유지

**교정 금지사항:**
- 새로운 평가 내용 추가 금지
- 기존 평가 내용 수정 금지
- 구체적인 예시나 제안 추가 금지
- 평가 점수나 기준에 대한 언급 추가 금지

**현재 피드백:**
"${currentFeedback}"

**과업명:** ${taskTitle}
**점수:** ${score}점

위 피드백의 의미와 내용은 그대로 유지하고, 오직 문법과 표현만 자연스럽게 교정해주세요. **500자 이내**로 완전한 문장으로 끝맺음해주세요.`;

  return await callGemini(prompt);
}

// 의미없는 문자 나열 및 지나친 공백 감지 함수
function detectMeaninglessContent(feedback: string): { isValid: boolean; reason?: string } {
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
  // 연속 점 5개 이상
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
  if (sentences.length >= 3 && uniqueSentences.size < sentences.length * 0.7) {
    return { isValid: false, reason: '반복적인 문장으로 글자 수를 늘린 것으로 보입니다' };
  }

  // 5. 과도한 이모지나 특수 기호 사용
  // 일반적인 이모지들을 개별적으로 검사 (범위 문제 회피)
  const commonEmojis = ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🈳', '🈂️', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '🚻', '🚮', '🎦', '📶', '🈁', '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
  let emojiCount = 0;
  for (const char of text) {
    if (commonEmojis.includes(char)) {
      emojiCount++;
    }
  }
  if (emojiCount > text.length * 0.1) {
    return { isValid: false, reason: '과도한 이모지 사용으로 인한 의미없는 내용이 감지되었습니다' };
  }

  return { isValid: true };
}

// 단순하고 일반적인 피드백 감지 함수 (AI 강화)
async function detectGenericFeedback(feedback: string): Promise<{ isGeneric: boolean; reason?: string }> {
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

  // 3. AI를 활용한 고급 일반성 검사
  try {
    const prompt = `${EVALUATION_GUIDE_KNOWLEDGE}

다음 피드백이 성과평가에 적합한 구체적이고 의미 있는 피드백인지 평가해주세요.

**검사할 피드백:**
"${text}"

**판정 기준:**
1. 구체적인 성과나 행동에 대한 언급이 있는가?
2. 개선점이나 향후 방향성이 제시되었는가?
3. 평가가이드의 기준(기여방식, 기여범위 등)과 연관된 내용인가?
4. 단순한 격려나 일반적인 표현에 그치지 않는가?
5. 평가 대상자에게 실질적인 도움이 되는 내용인가?

**판정 결과:**
- 구체적이고 적절한 피드백: "GOOD: 적절한 피드백입니다"
- 일반적이거나 부적절한 피드백: "GENERIC: [구체적인 이유]"

평가가이드 기준에 따라 객관적으로 판정해주세요.`;

    const result = await callGemini(prompt);
    
    if (result.startsWith('GENERIC:')) {
      return { 
        isGeneric: true, 
        reason: result.replace('GENERIC:', '').trim() || '구체성이 부족한 피드백입니다'
      };
    }
  } catch (error) {
    console.warn('⚠️ AI 일반성 검사 실패:', error);
    // AI 검사 실패 시 기본 검사만 수행
  }

  return { isGeneric: false };
}

// 중복피드백 검사 (다른 피평가자들과 비교) - 더 엄격한 검사
export async function checkSimilarFeedback(
  newFeedback: string,
  existingFeedbacks: string[],
  evaluatorName: string
): Promise<{ isDuplicate: boolean; summary: string }> {
  // 0. 빈 피드백 검사
  if (!newFeedback || !newFeedback.trim()) {
    return {
      isDuplicate: true,
      summary: '피드백을 입력해주세요. 빈 피드백은 저장할 수 없습니다.'
    };
  }

  if (existingFeedbacks.length === 0) {
    // 다른 피드백과 비교할 수 없어도 일반성 검사는 수행
    const genericCheck = await detectGenericFeedback(newFeedback);
    if (genericCheck.isGeneric) {
      return {
        isDuplicate: true,
        summary: genericCheck.reason || '구체성이 부족한 피드백입니다'
      };
    }
    return { isDuplicate: false, summary: '비교할 다른 피드백이 없습니다.' };
  }

  // 1. 의미없는 내용 감지
  const meaningfulnessCheck = detectMeaninglessContent(newFeedback);
  if (!meaningfulnessCheck.isValid) {
    return {
      isDuplicate: true,
      summary: meaningfulnessCheck.reason || '부적절한 내용이 감지되었습니다'
    };
  }

  // 2. 일반적이고 단순한 표현 감지 (AI 강화)
  const genericCheck = await detectGenericFeedback(newFeedback);
  if (genericCheck.isGeneric) {
    return {
      isDuplicate: true,
      summary: genericCheck.reason || '구체성이 부족한 피드백입니다'
    };
  }

  // 3. 기본 길이 및 문장 구조 검사
  const feedbackLength = newFeedback.trim().length;
  const sentenceCount = newFeedback.split(/[.!?다요]\s*/).filter(s => s.trim().length > 0).length;
  
  if (feedbackLength < 30) {
    return { 
      isDuplicate: true, 
      summary: `너무 짧은 피드백입니다 (${feedbackLength}자). 최소 30자 이상의 구체적인 피드백을 작성해주세요.` 
    };
  }
  
  if (sentenceCount <= 1 && feedbackLength < 50) {
    return { 
      isDuplicate: true, 
      summary: `너무 단순한 피드백입니다 (${sentenceCount}문장). 더 구체적이고 상세한 피드백을 작성해주세요.` 
    };
  }

  const prompt = `${EVALUATION_GUIDE_KNOWLEDGE}

평가자 "${evaluatorName}"가 다른 피평가자들에게 작성한 기존 피드백들과 새로운 피드백을 비교하여 성의없는 피드백을 감지해주세요.

**감지 기준:**
1. 복사-붙여넣기 (95% 이상 동일)
2. 단어 몇 개만 바꾼 경우 (85% 이상 유사)
3. 의미없는 반복적 표현 사용
4. 평가가이드에 맞지 않는 부적절한 내용
5. 구체성이 부족한 일반적인 표현만 사용

**새로운 피드백:**
"${newFeedback}"

**기존 피드백들:**
${existingFeedbacks.slice(0, 10).map((fb, index) => `${index + 1}. "${fb}"`).join('\n')}

**응답 형식:**
성의없는 피드백이 감지되면: "DUPLICATE: [감지된 이유를 간단히 요약]"
문제없으면: "OK: 적절한 피드백입니다"

평가가이드 기준에 따라 분석하여 응답해주세요.`;

  try {
    const result = await callGemini(prompt);
    
    if (result.startsWith('DUPLICATE:')) {
      return { 
        isDuplicate: true, 
        summary: result.replace('DUPLICATE:', '').trim() 
      };
    } else {
      return { 
        isDuplicate: false, 
        summary: result.replace('OK:', '').trim() 
      };
    }
  } catch (error) {
    console.warn('⚠️ AI 중복 검사 실패:', error);
    return { 
      isDuplicate: false, 
      summary: '중복 검사 중 오류가 발생했습니다.' 
    };
  }
}

// 가벼운 일반 채팅
export async function chatWithAI(
  userMessage: string,
  context: {
    taskTitle: string;
    taskDescription: string;
    score?: number;
    contributionMethod?: string;
    contributionScope?: string;
  }
): Promise<string> {
  const prompt = `${EVALUATION_GUIDE_KNOWLEDGE}

위 평가가이드 내용을 참고하여 질문에 답변해주세요.

**현재 과업:** ${context.taskTitle}

**사용자 질문:** ${userMessage}

**응답 규칙:**
1. 평가가이드의 내용과 철학에 기반하여 답변
2. 친근하고 간단하게 답변
3. 300자 이내로 답변
4. 피드백 작성과 관련된 실용적인 조언
5. 평가가이드의 용어와 기준을 적절히 활용

평가가이드에 기반한 도움이 되는 답변을 해주세요.`;

  return await callGemini(prompt);
}

// Gemini API 키 확인
export function checkGeminiKey(): boolean {
  return GEMINI_API_KEY && GEMINI_API_KEY.length > 10;
}

// Gemini 연결 테스트
export async function testGeminiConnection(): Promise<{ success: boolean; model?: string; response?: string; error?: string }> {
  if (!checkGeminiKey()) {
    return {
      success: false,
      error: 'API 키가 설정되지 않았습니다. src/lib/gemini.ts 파일에서 GEMINI_API_KEY를 확인해주세요.'
    };
  }

  try {
    console.log('🔍 Gemini API 연결 테스트 시작...');
    
    const testPrompt = '안녕하세요. 간단한 테스트입니다.';
    const response = await callGemini(testPrompt);
    
    console.log('✅ Gemini API 연결 성공!');
    return {
      success: true,
      response: response
    };
  } catch (error) {
    console.error('❌ Gemini API 연결 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    };
  }
} 