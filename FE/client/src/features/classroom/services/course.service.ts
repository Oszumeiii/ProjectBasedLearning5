import axiosInstance from "../../../services/axios";

export interface Course {
  id: number;
  name: string;
  code: string;
  description: string | null;
  semester: string;
  academic_year: string;
  course_type: string;
  lecturer_id: number;
  lecturer_name: string | null;
  lecturer_email: string | null;
  student_count: number;
  created_at: string;
}

export const listCourses = async (): Promise<Course[]> => {
  const response = await axiosInstance.get("/courses");
  return response.data.items;
};

export const getMyEnrollments = async (): Promise<Course[]> => {
  const response = await axiosInstance.get("/courses/my/enrollments");
  return response.data.items;
};

export const getCourseById = async (id: number) => {
  const response = await axiosInstance.get(`/courses/${id}`);
  return response.data;
};
