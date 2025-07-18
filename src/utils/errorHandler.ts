import { ApiError } from '@/types';

// 에러 타입 정의
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN'
}

// 에러 메시지 매핑
const ERROR_MESSAGES = {
  [ErrorType.NETWORK]: '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.',
  [ErrorType.VALIDATION]: '입력한 정보가 올바르지 않습니다.',
  [ErrorType.AUTHENTICATION]: '로그인이 필요합니다.',
  [ErrorType.AUTHORIZATION]: '접근 권한이 없습니다.',
  [ErrorType.NOT_FOUND]: '요청한 정보를 찾을 수 없습니다.',
  [ErrorType.SERVER]: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  [ErrorType.UNKNOWN]: '알 수 없는 오류가 발생했습니다.'
} as const;

// 에러 클래스
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly code?: string;
  public readonly details?: any;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    code?: string,
    details?: any
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.code = code;
    this.details = details;
  }

  // 사용자 친화적인 메시지 반환
  getUserMessage(): string {
    return this.message || ERROR_MESSAGES[this.type];
  }
}

// 에러 처리 유틸리티
export const errorHandler = {
  // 에러 타입 분류
  classifyError: (error: any): ErrorType => {
    if (error instanceof AppError) {
      return error.type;
    }

    // 네트워크 에러
    if (error.name === 'NetworkError' || error.message?.includes('network')) {
      return ErrorType.NETWORK;
    }

    // Supabase 에러 코드 기반 분류
    if (error.code) {
      switch (error.code) {
        case 'PGRST116': // No rows found
          return ErrorType.NOT_FOUND;
        case 'PGRST301': // JWT expired
        case 'PGRST302': // JWT invalid
          return ErrorType.AUTHENTICATION;
        case 'PGRST303': // JWT missing
          return ErrorType.AUTHORIZATION;
        default:
          return ErrorType.SERVER;
      }
    }

    // HTTP 상태 코드 기반 분류
    if (error.status) {
      switch (error.status) {
        case 400:
          return ErrorType.VALIDATION;
        case 401:
          return ErrorType.AUTHENTICATION;
        case 403:
          return ErrorType.AUTHORIZATION;
        case 404:
          return ErrorType.NOT_FOUND;
        case 500:
          return ErrorType.SERVER;
        default:
          return ErrorType.UNKNOWN;
      }
    }

    return ErrorType.UNKNOWN;
  },

  // 에러를 AppError로 변환
  createAppError: (error: any): AppError => {
    if (error instanceof AppError) {
      return error;
    }

    const type = errorHandler.classifyError(error);
    const message = error.message || ERROR_MESSAGES[type];
    const code = error.code || error.status?.toString();

    return new AppError(message, type, code, error);
  },

  // 에러 로깅
  logError: (error: AppError, context?: string): void => {
    console.error(`[${context || 'App'}] Error:`, {
      type: error.type,
      code: error.code,
      message: error.message,
      details: error.details,
      stack: error.stack
    });
  },

  // 사용자에게 표시할 에러 메시지 생성
  getDisplayMessage: (error: any): string => {
    const appError = errorHandler.createAppError(error);
    return appError.getUserMessage();
  },

  // 에러 복구 가능 여부 확인
  isRecoverable: (error: AppError): boolean => {
    return error.type !== ErrorType.AUTHORIZATION && error.type !== ErrorType.AUTHENTICATION;
  }
};

// API 에러 처리
export const apiErrorHandler = {
  // Supabase 에러 처리
  handleSupabaseError: (error: any): AppError => {
    if (error.code === 'PGRST116') {
      return new AppError('요청한 데이터를 찾을 수 없습니다.', ErrorType.NOT_FOUND, error.code);
    }
    
    if (error.code === 'PGRST301' || error.code === 'PGRST302') {
      return new AppError('로그인이 만료되었습니다. 다시 로그인해주세요.', ErrorType.AUTHENTICATION, error.code);
    }
    
    if (error.code === 'PGRST303') {
      return new AppError('접근 권한이 없습니다.', ErrorType.AUTHORIZATION, error.code);
    }
    
    return new AppError('데이터베이스 오류가 발생했습니다.', ErrorType.SERVER, error.code);
  },

  // 네트워크 에러 처리
  handleNetworkError: (error: any): AppError => {
    if (error.message?.includes('fetch')) {
      return new AppError('서버와의 연결에 실패했습니다.', ErrorType.NETWORK);
    }
    
    return new AppError('네트워크 오류가 발생했습니다.', ErrorType.NETWORK);
  },

  // 일반적인 API 에러 처리
  handleApiError: (error: any): AppError => {
    // Supabase 에러
    if (error.code && error.code.startsWith('PGRST')) {
      return apiErrorHandler.handleSupabaseError(error);
    }
    
    // 네트워크 에러
    if (error.name === 'TypeError' && error.message?.includes('fetch')) {
      return apiErrorHandler.handleNetworkError(error);
    }
    
    // 기타 에러
    return errorHandler.createAppError(error);
  }
};

// 폼 에러 처리
export const formErrorHandler = {
  // 폼 검증 에러 처리
  handleValidationError: (errors: string[]): AppError => {
    const message = errors.length === 1 
      ? errors[0] 
      : `다음 오류들을 수정해주세요:\n${errors.join('\n')}`;
    
    return new AppError(message, ErrorType.VALIDATION);
  },

  // 필드별 에러 메시지 생성
  createFieldErrors: (errors: Record<string, string[]>): Record<string, string> => {
    const fieldErrors: Record<string, string> = {};
    
    Object.entries(errors).forEach(([field, fieldErrors]) => {
      fieldErrors[field] = fieldErrors.join(', ');
    });
    
    return fieldErrors;
  }
}; 