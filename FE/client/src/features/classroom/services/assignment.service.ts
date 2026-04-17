import axiosInstance from "../../../services/axios";
import { downloadBinaryFile } from "./report.service";

export type AssignmentType = "report" | "exercise" | "project" | "quiz";
export type SubmissionStatus = "not_submitted" | "submitted" | "late" | "graded" | "returned";

export interface AssignmentAttachment {
  name: string;
  url?: string;
  size?: string;
}

export interface AssignmentAttachmentInput {
  file: File;
  name: string;
  size: string;
}

export interface AssignmentSubmission {
  id: number;
  assignment_id: number;
  student_id: number;
  student_name?: string;
  student_email?: string;
  report_id?: number | null;
  status: SubmissionStatus;
  submitted_at: string | null;
  is_late?: boolean;
  score: number | null;
  feedback: string | null;
  graded_at?: string | null;
  report_file_name?: string | null;
  report_file_size?: number | null;
}

export interface Assignment {
  id: number;
  course_id: number;
  title: string;
  description: string | null;
  assignment_type: AssignmentType;
  deadline: string;
  max_score: number;
  attachments: AssignmentAttachment[];
  created_at: string;
  created_by?: number;
  created_by_name?: string | null;
  total_submissions?: number;
  submitted_count?: number;
  graded_count?: number;
  submissions?: AssignmentSubmission[];
}

export interface AssignmentStats {
  total: number;
  submitted: number;
  graded: number;
  late: number;
  isOverdue: boolean;
  avgScore: number | null;
}

export const listAssignmentsByCourse = async (courseId: number): Promise<Assignment[]> => {
  const response = await axiosInstance.get<{ items: Assignment[] }>(`/assignments/course/${courseId}`);
  return response.data.items.map((item) => ({
    ...item,
    id: Number(item.id),
    course_id: Number(item.course_id),
    created_by: item.created_by !== undefined ? Number(item.created_by) : undefined,
    max_score: Number(item.max_score),
    total_submissions:
      item.total_submissions !== undefined ? Number(item.total_submissions) : undefined,
    submitted_count:
      item.submitted_count !== undefined ? Number(item.submitted_count) : undefined,
    graded_count:
      item.graded_count !== undefined ? Number(item.graded_count) : undefined,
    attachments: Array.isArray(item.attachments) ? item.attachments : [],
  }));
};

export const createAssignment = async (body: {
  courseId: number;
  title: string;
  description?: string;
  assignmentType: AssignmentType;
  deadline: string;
  maxScore: number;
  attachments?: AssignmentAttachment[];
  attachmentFiles?: File[];
}) => {
  const formData = new FormData();
  formData.append("courseId", String(body.courseId));
  formData.append("title", body.title);
  if (body.description) formData.append("description", body.description);
  formData.append("assignmentType", body.assignmentType);
  formData.append("deadline", body.deadline);
  formData.append("maxScore", String(body.maxScore));
  if (body.attachments?.length) {
    formData.append("attachments", JSON.stringify(body.attachments));
  }
  if (body.attachmentFiles?.length) {
    body.attachmentFiles.forEach((file) => formData.append("files", file));
  }

  const response = await axiosInstance.post(`/assignments`, formData);
  return response.data;
};

export const patchAssignment = async (
  id: number,
  body: Partial<{
    title: string;
    description: string | null;
    assignmentType: AssignmentType;
    deadline: string;
    maxScore: number;
    attachments: AssignmentAttachment[];
    attachmentFiles: File[];
    isPublished: boolean;
  }>
) => {
  const formData = new FormData();
  if (body.title !== undefined) formData.append("title", body.title);
  if (body.description !== undefined) formData.append("description", body.description ?? "");
  if (body.assignmentType !== undefined) formData.append("assignmentType", body.assignmentType);
  if (body.deadline !== undefined) formData.append("deadline", body.deadline);
  if (body.maxScore !== undefined) formData.append("maxScore", String(body.maxScore));
  if (body.isPublished !== undefined) formData.append("isPublished", String(body.isPublished));
  if (body.attachments !== undefined) {
    formData.append("attachments", JSON.stringify(body.attachments));
  }
  if (body.attachmentFiles?.length) {
    body.attachmentFiles.forEach((file) => formData.append("files", file));
  }

  const response = await axiosInstance.patch(`/assignments/${id}`, formData);
  return response.data;
};

export const deleteAssignment = async (id: number) => {
  const response = await axiosInstance.delete(`/assignments/${id}`);
  return response.data;
};

export const listAssignmentSubmissions = async (assignmentId: number): Promise<AssignmentSubmission[]> => {
  const response = await axiosInstance.get<{ items: AssignmentSubmission[] }>(
    `/assignments/${assignmentId}/submissions`
  );
  return response.data.items.map((item) => ({
    ...item,
    id: Number(item.id),
    assignment_id: Number(item.assignment_id),
    student_id: Number(item.student_id),
    report_id: item.report_id !== null && item.report_id !== undefined ? Number(item.report_id) : null,
    score: item.score !== null && item.score !== undefined ? Number(item.score) : null,
    report_file_size:
      item.report_file_size !== null && item.report_file_size !== undefined
        ? Number(item.report_file_size)
        : null,
  }));
};

export const submitAssignment = async (
  assignmentId: number,
  formData: FormData
): Promise<{ message: string; reportId: number; status: SubmissionStatus }> => {
  const response = await axiosInstance.post(`/assignments/${assignmentId}/submit`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const gradeSubmission = async (
  submissionId: number,
  body: { feedback: string; score?: number | null }
) => {
  if (!Number.isFinite(submissionId) || submissionId <= 0) {
    throw new Error("submissionId không hợp lệ");
  }
  const response = await axiosInstance.patch(`/assignments/submissions/${submissionId}/grade`, body);
  return response.data;
};

export const downloadAssignmentAttachmentInBrowser = async (
  assignmentId: number,
  attachmentIndex: number,
  preferredFileName?: string
) => {
  await downloadBinaryFile(
    `/assignments/${assignmentId}/attachments/${attachmentIndex}/download`,
    preferredFileName
  );
};

export const getAssignmentStats = (assignment: Assignment): AssignmentStats => {
  const submissions = assignment.submissions ?? [];
  const total = submissions.length || Number(assignment.total_submissions ?? 0);
  const submitted = submissions.length
    ? submissions.filter((s) => s.status !== "not_submitted").length
    : Number(assignment.submitted_count ?? 0);
  const graded = submissions.length
    ? submissions.filter((s) => s.status === "graded").length
    : Number(assignment.graded_count ?? 0);
  const late = submissions.filter((s) => s.status === "late").length;
  const gradedWithScore = submissions.filter((s) => s.score !== null);
  const avgScore = gradedWithScore.length
    ? gradedWithScore.reduce((sum, s) => sum + Number(s.score || 0), 0) / gradedWithScore.length
    : null;

  return {
    total,
    submitted,
    graded,
    late,
    isOverdue: new Date(assignment.deadline) < new Date(),
    avgScore,
  };
};
