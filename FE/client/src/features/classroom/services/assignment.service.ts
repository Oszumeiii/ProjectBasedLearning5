import axiosInstance from "../../../services/axios";

export type AssignmentType = "report" | "exercise" | "project" | "quiz";
export type SubmissionStatus = "not_submitted" | "submitted" | "late" | "graded" | "returned";

export interface AssignmentAttachment {
  name: string;
  url?: string;
  size?: string;
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
}) => {
  const response = await axiosInstance.post(`/assignments`, body);
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
    isPublished: boolean;
  }>
) => {
  const response = await axiosInstance.patch(`/assignments/${id}`, body);
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
  return response.data.items;
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
  body: { score: number; feedback: string }
) => {
  const response = await axiosInstance.patch(`/assignments/submissions/${submissionId}/grade`, body);
  return response.data;
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
