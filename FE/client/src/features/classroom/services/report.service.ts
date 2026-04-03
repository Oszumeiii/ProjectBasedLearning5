import axiosInstance from "../../../services/axios";

export interface Report {
  id: number;
  title: string;
  description: string | null;
  status: string;
  file_url: string | null;
  file_type: string | null;
  file_size: number | null;
  visibility: string;
  view_count: number;
  content: string | null;
  project_id: number | null;
  course_id: number | null;
  research_paper_id: number | null;
  author_id: number;
  author_name: string;
  author_email: string;
  reviewer_name: string | null;
  review_note: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReportVersion {
  id: number;
  report_id: number;
  version_number: number;
  file_url: string;
  file_type: string;
  file_size: number;
  change_summary: string | null;
  created_at: string;
}

export interface ReportRating {
  id: number;
  report_id: number;
  user_id: number;
  rating: number;
  comment: string | null;
  reviewer_name: string;
  created_at: string;
}

export interface ListReportsParams {
  status?: string;
  courseId?: number;
  authorId?: number;
  projectId?: number;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export const listReports = async (params?: ListReportsParams) => {
  const response = await axiosInstance.get("/reports", { params });
  return response.data;
};

export const getReportById = async (id: number): Promise<Report> => {
  const response = await axiosInstance.get(`/reports/${id}`);
  return response.data;
};

export const createReport = async (formData: FormData) => {
  const response = await axiosInstance.post("/reports", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateReport = async (
  id: number,
  data: Partial<{
    title: string;
    description: string;
    visibility: string;
    projectId: number;
    courseId: number;
  }>
) => {
  const response = await axiosInstance.patch(`/reports/${id}`, data);
  return response.data;
};

export const deleteReport = async (id: number) => {
  const response = await axiosInstance.delete(`/reports/${id}`);
  return response.data;
};

export const updateReportStatus = async (
  id: number,
  status: string,
  reviewNote?: string
) => {
  const response = await axiosInstance.patch(`/reports/${id}/status`, {
    status,
    reviewNote,
  });
  return response.data;
};

export const resubmitReport = async (id: number, formData: FormData) => {
  const response = await axiosInstance.post(
    `/reports/${id}/resubmit`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
};

export const downloadReport = async (id: number) => {
  const response = await axiosInstance.get(`/reports/${id}/download`);
  return response.data;
};

export const listReportVersions = async (
  id: number
): Promise<ReportVersion[]> => {
  const response = await axiosInstance.get(`/reports/${id}/versions`);
  return response.data.items;
};

export const upsertRating = async (
  id: number,
  rating: number,
  comment?: string
) => {
  const response = await axiosInstance.post(`/reports/${id}/rating`, {
    rating,
    comment,
  });
  return response.data;
};

export const getRatings = async (id: number): Promise<ReportRating[]> => {
  const response = await axiosInstance.get(`/reports/${id}/ratings`);
  return response.data.items;
};

export const addFavorite = async (id: number) => {
  const response = await axiosInstance.post(`/reports/${id}/favorite`);
  return response.data;
};

export const removeFavorite = async (id: number) => {
  const response = await axiosInstance.delete(`/reports/${id}/favorite`);
  return response.data;
};
