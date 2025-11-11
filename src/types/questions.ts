export type QuestionType = 
  | "text"
  | "nps"
  | "csat" 
  | "ces"
  | "stars"
  | "emojis"
  | "hearts"
  | "multiple_choice"
  | "single_choice"
  | "like_dislike"
  | "matrix"
  | "likert";

export interface ScaleConfig {
  // NPS
  npsLabels?: { min: string; max: string };
  
  // CSAT
  csatScale?: 3 | 5 | 7;
  csatLabels?: string[];
  
  // CES
  cesScale?: 5 | 7;
  cesLabels?: { min: string; max: string };
  
  // Estrelas e Corações
  maxValue?: number;
  
  // Emojis
  emojiSet?: string[];
  
  // Opções (múltipla/única escolha)
  options?: string[];
  minSelections?: number;
  maxSelections?: number;
  
  // Likert
  likertScale?: 5 | 7;
  likertLabels?: string[];
  
  // Matriz
  matrixRows?: string[];
  matrixColumns?: string[];
  
  // Like/Dislike
  likeLabel?: string;
  dislikeLabel?: string;
  
  // Geral
  isRequired?: boolean;
  placeholder?: string;
  helpText?: string;
}

export interface Question {
  id: string;
  question_text: string;
  question_type: QuestionType;
  scale_config?: ScaleConfig;
  order_index: number;
}
