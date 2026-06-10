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
  });
  return response.data;
};

export interface ReportSummaryResponse {
  reportId: number;
  title: string;
  summary: string;
}

export const getReportSummary = async (
  reportId: number
): Promise<ReportSummaryResponse> => {
  const response = await axiosInstance.post<ReportSummaryResponse>(
    "/rag/summary",
    { reportId }
  );
  return response.data;
};
