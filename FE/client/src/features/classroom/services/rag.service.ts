import axiosInstance from "../../../services/axios";

export interface RagContext {
  id: number;
  reportId: number;
  reportTitle?: string;
  content: string;
  pageNumber: number | null;
  sectionTitle: string | null;
  score: number;
}

export interface RagQAResponse {
  question: string;
  answer: string;
  contexts: RagContext[];
}

export const askRagQA = async (body: {
  question: string;
  reportId?: number | null;
  topK?: number;
}): Promise<RagQAResponse> => {
  const response = await axiosInstance.post<RagQAResponse>("/rag/qa", {
    question: body.question,
    reportId: body.reportId ?? undefined,
    topK: body.topK ?? 5,
  });
  return response.data;
};
