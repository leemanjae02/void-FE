export interface BaseResponse<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
}

export interface AskRequest {
  content: string;
}

export interface AskResult {
  keyword: string[];
  answer: string;
}

export interface RankingItem {
  keyword: string;
  percentage: string; /* "11%" 형태의 문자열 */
}

export type AskResponse = BaseResponse<AskResult>;
export type RankingResponse = BaseResponse<RankingItem[]>;
