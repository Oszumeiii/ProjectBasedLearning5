import axiosInstance from "../../../services/axios";

export interface Report {
  id: number;
  title: string;
  description: string | null;
  status: string;
  file_url: string | null;
  file_name?: string | null;
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

export interface ReportFeedback {
  id: number;
  report_id: number;
  user_id: number;
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
  sort?: "recent" | "popular" | "rated" | "newest";
}

export const listReports = async (params?: ListReportsParams) => {
  const normalizedParams = params
    ? {
        ...params,
        sort: params.sort === "newest" ? "recent" : params.sort,
      }
    : undefined;
  const response = await axiosInstance.get("/reports", { params: normalizedParams });
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

const getFileNameFromDisposition = (contentDisposition?: string | null) => {
  if (!contentDisposition) return null;
  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }
  const basicMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  return basicMatch?.[1] ?? null;
};

export const downloadBinaryFile = async (
  url: string,
  preferredFileName?: string | null
): Promise<void> => {
  const response = await axiosInstance.get(url, { responseType: "blob" });
  const blob = new Blob([response.data], {
    type: response.headers["content-type"] || response.data?.type || "application/octet-stream",
  });
  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download =
    preferredFileName?.trim() ||
    getFileNameFromDisposition(response.headers["content-disposition"]) ||
    "download";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(objectUrl);
};

export const downloadReport = async (id: number): Promise<void> => {
  await downloadBinaryFile(`/reports/${id}/download`);
};

export const downloadReportInBrowser = async (
  id: number,
  preferredFileName?: string | null
) => {
  await downloadBinaryFile(`/reports/${id}/download`, preferredFileName);
};

export const listReportVersions = async (
  id: number
): Promise<ReportVersion[]> => {
  const response = await axiosInstance.get(`/reports/${id}/versions`);
  return response.data.items;
};

export const getReportFeedback = async (id: number): Promise<ReportFeedback[]> => {
  const report = await getReportById(id);
  if (!report.review_note?.trim()) return [];
  return [
    {
      id: report.id,
      report_id: report.id,
      user_id: 0,
      comment: report.review_note,
      reviewer_name: report.reviewer_name || "Giảng viên",
      created_at: report.updated_at,
    },
  ];
};

export const addFavorite = async (id: number) => {
  const response = await axiosInstance.post(`/reports/${id}/favorite`);
  return response.data;
};

export const removeFavorite = async (id: number) => {
  const response = await axiosInstance.delete(`/reports/${id}/favorite`);
  return response.data;
};
