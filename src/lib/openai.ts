// OpenAI API 호출 유틸리티
// 실제 서비스에서는 백엔드 프록시를 권장하지만, 데모용으로 프론트엔드에서 직접 호출

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || 'your-openai-api-key-here'; // 환경변수에서 가져오거나 기본값 사용
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface FeedbackSuggestion {
  type: 'recommendation' | 'correction' | 'warning' | 'improvement';
  content: string;
  explanation?: string;
}

// OpenAI API 호출 함수
async function callOpenAI(messages: ChatMessage[]): Promise<string> {
  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API 호출 실패: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '응답을 받지 못했습니다.';
  } catch (error) {
    console.error('OpenAI API 호출 오류:', error);
    throw new Error('AI 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
  }
}

// 피드백 추천 생성
export async function generateFeedbackRecommendation(
  taskTitle: string,
  taskDescription: string,
  score: number,
  contributionMethod: string,
  contributionScope: string,
  currentFeedback?: string
): Promise<string> {
  const systemPrompt = `당신은 성과평가 전문가입니다. 
평가자에게 구체적이고 건설적인 피드백을 추천해주세요.

평가 기준:
- 점수: 1-4점 (1: 미흡, 2: 보통, 3: 양호, 4: 우수)
- 기여방식: 총괄/리딩/실무/지원
- 기여범위: 의존적/독립적/상호적/전략적

피드백 작성 원칙:
1. 구체적이고 객관적이어야 함
2. 개선점과 장점을 균형있게 언급
3. 행동 기반 피드백 제공
4. 성장 방향 제시
5. 한국어로 작성

응답은 피드백 내용만 작성하세요.`;

  const userPrompt = `과업: ${taskTitle}
설명: ${taskDescription}
점수: ${score}점
기여방식: ${contributionMethod}
기여범위: ${contributionScope}
${currentFeedback ? `현재 피드백: ${currentFeedback}` : ''}

위 정보를 바탕으로 적절한 피드백을 추천해주세요.`;

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  return await callOpenAI(messages);
}

// 피드백 교정/개선
export async function improveFeedback(
  currentFeedback: string,
  taskTitle: string,
  score: number
): Promise<string> {
  const systemPrompt = `당신은 성과평가 피드백 전문가입니다.
주어진 피드백을 더 구체적이고 효과적으로 개선해주세요.

개선 기준:
1. 더 구체적이고 구체적인 예시 추가
2. 객관적이고 전문적인 톤으로 수정
3. 행동 기반 피드백으로 변경
4. 건설적인 개선 방안 제시
5. 한국어로 작성

응답은 개선된 피드백 내용만 작성하세요.`;

  const userPrompt = `현재 피드백: ${currentFeedback}
과업: ${taskTitle}
점수: ${score}점

위 피드백을 개선해주세요.`;

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  return await callOpenAI(messages);
}

// 유사 피드백 경고
export async function checkSimilarFeedback(
  newFeedback: string,
  existingFeedbacks: string[]
): Promise<string> {
  if (existingFeedbacks.length === 0) {
    return '유사한 피드백이 없습니다.';
  }

  const systemPrompt = `당신은 피드백 중복 검사 전문가입니다.
새로운 피드백이 기존 피드백들과 유사한지 분석해주세요.

분석 기준:
1. 내용의 유사성 (70% 이상 유사시 경고)
2. 표현의 중복성
3. 피드백의 다양성

응답 형식:
- 유사하지 않음: "유사한 피드백이 없습니다."
- 유사함: "다음 기존 피드백과 유사합니다: [유사한 피드백 내용]"

한국어로 응답하세요.`;

  const userPrompt = `새로운 피드백: ${newFeedback}

기존 피드백들:
${existingFeedbacks.map((fb, index) => `${index + 1}. ${fb}`).join('\n')}

새로운 피드백이 기존 피드백들과 유사한지 분석해주세요.`;

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  return await callOpenAI(messages);
}

// 일반적인 AI 채팅
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
  const systemPrompt = `당신은 성과평가 전문가 AI 어시스턴트입니다.
평가자와 피평가자에게 성과평가와 피드백 작성에 대한 도움을 제공합니다.

역할:
- 피드백 작성 가이드
- 평가 기준 설명
- 구체적인 예시 제공
- 개선 방안 제시

항상 친근하고 전문적인 톤으로 한국어로 응답하세요.`;

  const userPrompt = `과업: ${context.taskTitle}
설명: ${context.taskDescription}
${context.score ? `점수: ${context.score}점` : ''}
${context.contributionMethod ? `기여방식: ${context.contributionMethod}` : ''}
${context.contributionScope ? `기여범위: ${context.contributionScope}` : ''}

사용자 질문: ${userMessage}`;

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  return await callOpenAI(messages);
}

// API 키 설정 함수 (실제 사용시)
export function setOpenAIKey(apiKey: string) {
  // 실제 구현시에는 환경변수나 안전한 방법으로 관리
  console.log('OpenAI API 키가 설정되었습니다.');
} 