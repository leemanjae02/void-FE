import axios from "axios";
import type { AskResponse, RankingResponse } from "../@types/api";

// 환경변수에서 API URL을 가져오거나 기본값 사용
const BASE_URL = import.meta.env.VITE_API_URL;

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const userService = {
  /**
   * 사용자 질문을 전송하고 답변을 받습니다.
   * POST /ask
   */
  ask: async (text: string): Promise<AskResponse> => {
    try {
      const response = await api.post<AskResponse>("/ask", { text });
      return response.data;
    } catch (error) {
      console.error("Ask API Error:", error);
      throw error;
    }
  },

  /**
   * 실시간 Top 3 키워드를 가져옵니다.
   * GET /ranking/top3
   */
  getTop3Keywords: async (): Promise<RankingResponse> => {
    try {
      const response = await api.get<RankingResponse>("/ranking/top3");
      return response.data;
    } catch (error) {
      console.error("Ranking API Error:", error);
      throw error;
    }
  },
};
