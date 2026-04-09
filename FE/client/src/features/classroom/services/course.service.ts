import axiosInstance from "../../../services/axios";

export interface Course {
  id: number;
  name: string;
  code: string;
  description: string | null;
  semester: string;
  academic_year?: string;
  academicYear?: string;
  course_type: string;
  lecturer_id: number;
  lecturer_name: string | null;
  lecturer_email: string | null;
  student_count: number;
  created_at: string;
  /** Mã 6 ký tự để SV tham gia lớp (khác mã học phần `code`) */
  enrollment_code?: string | null;
  enrollment_status?: string;
  max_students?: number;
  is_active?: boolean;
}

export interface CourseListParams {
  semester?: string;
  course_type?: string;
  lecturer_id?: number;
}

export const listCourses = async (params?: CourseListParams): Promise<Course[]> => {
  const response = await axiosInstance.get<{ items: Course[] }>("/courses", { params });
  return response.data.items.map(normalizeCourse);
};

export const getMyCourses = async (params?: CourseListParams): Promise<Course[]> => {
  const response = await axiosInstance.get<{ items: Course[] }>("/courses/my", { params });
  return response.data.items.map(normalizeCourse);
};

export const getMyEnrollments = async (): Promise<Course[]> => {
  const response = await axiosInstance.get<{ items: Course[] }>("/courses/my/enrollments");
  return response.data.items.map(normalizeCourse);
};

export interface CreateCourseBody {
  name: string;
  /** Nếu bỏ trống, BE tự sinh mã dạng DA-HK12025-XXXX */
  code?: string;
  description?: string;
  semester: string;
  academicYear: string;
  courseType: "project" | "thesis" | "research" | "internship";
  /** Sĩ số tối đa (mặc định BE: 30, tối đa 500) */
  maxStudents?: number;
}

export const createCourse = async (body: CreateCourseBody) => {
  const response = await axiosInstance.post<Course>("/courses", {
    ...body,
    academicYear: body.academicYear,
    courseType: body.courseType,
    maxStudents: body.maxStudents,
  });
  return response.data;
};

/** Sinh viên: mã tham gia 6 ký tự hoặc mã học phần (code) đầy đủ — khớp BE */
export const joinCourseByJoinCode = async (courseCode: string) => {
  const response = await axiosInstance.post<{ message: string }>("/courses/join", {
    courseCode,
  });
  return response.data;
};

export const patchCourse = async (
  id: number,
  body: Partial<{
    name: string;
    description: string | null;
    semester: string;
    academicYear: string;
    maxStudents: number;
    isActive: boolean;
    courseType: string;
    submissionStart: string | null;
    submissionEnd: string | null;
    defenseDate: string | null;
  }>
) => {
  const response = await axiosInstance.patch(`/courses/${id}`, body);
  return response.data;
};

export const deleteCourse = async (id: number) => {
  const response = await axiosInstance.delete(`/courses/${id}`);
  return response.data;
};

export const getCourseById = async (id: number) => {
  const response = await axiosInstance.get(`/courses/${id}`);
  return response.data;
};

export const normalizeCourse = <T extends Partial<Course>>(course: T): T & Course => {
  return {
    ...course,
    academic_year: course.academic_year ?? course.academicYear ?? "",
    academicYear: course.academicYear ?? course.academic_year ?? "",
  } as T & Course;
};

export interface EnrollmentRow {
  enrollment_id: number;
  status: "pending" | "active" | "rejected" | "dropped" | "completed" | "failed" | string;
  enrolled_at: string;
  student_id: number;
  full_name: string;
  email: string;
  major: string | null;
  final_grade?: string | null;
  final_score?: number | null;
}

export const getCourseStudents = async (courseId: number) => {
  const response = await axiosInstance.get<{ items: EnrollmentRow[] }>(
    `/courses/${courseId}/students`
  );
  return response.data.items;
};

export type EnrollmentStatus =
  | "pending"
  | "active"
  | "rejected"
  | "dropped"
  | "completed"
  | "failed";

export const updateEnrollmentStatus = async (
  enrollmentId: number,
  status: EnrollmentStatus
) => {
  const response = await axiosInstance.patch(`/courses/enrollments/${enrollmentId}/status`, {
    status,
  });
  return response.data;
};

export const bulkUpdateEnrollmentStatus = async (
  courseId: number,
  body: { enrollmentIds: number[]; status: EnrollmentStatus }
) => {
  const response = await axiosInstance.patch(`/courses/${courseId}/enrollments/bulk-status`, body);
  return response.data;
};

export const updateEnrollmentGrade = async (
  enrollmentId: number,
  body: { finalGrade?: string | null; finalScore?: number | null }
) => {
  const response = await axiosInstance.patch(`/courses/enrollments/${enrollmentId}/grade`, body);
  return response.data;
};

export const enrollStudentStaff = async (
  courseId: number,
  body: { studentId?: number; email?: string }
) => {
  const response = await axiosInstance.post(`/courses/${courseId}/enroll`, body);
  return response.data;
};

export const addCourseLecturer = async (
  courseId: number,
  body: { lecturerId: number; roleInCourse?: "supervisor" | "reviewer" | "committee" }
) => {
  const response = await axiosInstance.post(`/courses/${courseId}/lecturers`, body);
  return response.data;
};

export const removeCourseLecturer = async (courseId: number, userId: number) => {
  const response = await axiosInstance.delete(`/courses/${courseId}/lecturers/${userId}`);
  return response.data;
};

export interface EvaluationCriterion {
  id: number;
  name: string;
  description: string | null;
  weight: string | number;
  max_score: string | number;
  order_index: number;
}

export const getEvaluationCriteria = async (courseId: number) => {
  const response = await axiosInstance.get<{
    items: EvaluationCriterion[];
    totalWeight: number;
  }>(`/courses/${courseId}/evaluation-criteria`);
  return response.data;
};

export const createEvaluationCriterion = async (
  courseId: number,
  body: {
    name: string;
    description?: string;
    weight: number;
    maxScore?: number;
    orderIndex?: number;
  }
) => {
  const response = await axiosInstance.post(`/courses/${courseId}/evaluation-criteria`, body);
  return response.data;
};

export const updateEvaluationCriterion = async (
  courseId: number,
  criteriaId: number,
  body: {
    name?: string;
    description?: string | null;
    weight?: number;
    maxScore?: number;
    orderIndex?: number;
  }
) => {
  const response = await axiosInstance.patch(
    `/courses/${courseId}/evaluation-criteria/${criteriaId}`,
    body
  );
  return response.data;
};

export const deleteEvaluationCriterion = async (
  courseId: number,
  criteriaId: number
) => {
  const response = await axiosInstance.delete(
    `/courses/${courseId}/evaluation-criteria/${criteriaId}`
  );
  return response.data;
};

export const reorderEvaluationCriteria = async (courseId: number, orderedIds: number[]) => {
  const response = await axiosInstance.patch(`/courses/${courseId}/evaluation-criteria/reorder`, {
    orderedIds,
  });
  return response.data;
};
