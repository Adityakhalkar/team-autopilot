// Backend API configuration and utility functions

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// API endpoints
export const API_ENDPOINTS = {
  QUIZ_GENERATE: `${API_BASE_URL}/quiz/generate`,
  TRANSLATE_GENERATE: `${API_BASE_URL}/translate/generate`,
  SUMMARY_GENERATE: `${API_BASE_URL}/summary/generate`,
  HEALTH: `${API_BASE_URL}/health`,
} as const;

// Utility function to handle API responses
export async function handleApiResponse(response: Response) {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }
  return response.json();
}

// Quiz generation API call
export interface QuizRequest {
  video_urls: string[];
  num_questions?: number;
  question_types?: ('multiple_choice' | 'true_false' | 'short_answer')[];
}

export async function generateQuiz(request: QuizRequest) {
  const response = await fetch(API_ENDPOINTS.QUIZ_GENERATE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      num_questions: 3,
      question_types: ['multiple_choice'],
      ...request,
    }),
  });

  return handleApiResponse(response);
}

// Translation API call
export interface TranslationRequest {
  video_urls: string[];
  target_language?: string;
  include_timestamps?: boolean;
}

export async function generateTranslation(request: TranslationRequest) {
  const response = await fetch(API_ENDPOINTS.TRANSLATE_GENERATE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      target_language: 'es',
      include_timestamps: false,
      ...request,
    }),
  });

  return handleApiResponse(response);
}

// Summary/Notes generation API call
export interface SummaryRequest {
  video_urls: string[];
  summary_type?: 'notes' | 'summary' | 'outline' | 'key_points';
  max_length?: number;
}

export async function generateSummary(request: SummaryRequest) {
  const response = await fetch(API_ENDPOINTS.SUMMARY_GENERATE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      summary_type: 'notes',
      max_length: 500,
      ...request,
    }),
  });

  return handleApiResponse(response);
}

// Health check
export async function checkHealth() {
  const response = await fetch(API_ENDPOINTS.HEALTH);
  return handleApiResponse(response);
}

// Language codes mapping
export const LANGUAGE_CODES = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  zh: 'Chinese',
  ja: 'Japanese',
  ko: 'Korean',
  pt: 'Portuguese',
  it: 'Italian',
  ru: 'Russian',
  ar: 'Arabic',
  hi: 'Hindi',
  nl: 'Dutch',
} as const;

export type LanguageCode = keyof typeof LANGUAGE_CODES;