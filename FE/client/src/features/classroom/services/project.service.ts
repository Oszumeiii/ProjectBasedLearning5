import axiosInstance from "../../../services/axios";

export interface Project {
  id: number;
  title: string;
  description: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  tags: string | null;
  course_id: number | null;
  student_id: number;
  supervisor_id: number | null;
  student_name: string;
  supervisor_name: string | null;
  course_name: string | null;
  created_at: string;
}

export interface ListProjectsParams {
  courseId?: number;
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export const listProjects = async (params?: ListProjectsParams) => {
  const response = await axiosInstance.get("/projects", { params });
  return response.data;
};

export const getProjectById = async (id: number) => {
  const response = await axiosInstance.get(`/projects/${id}`);
  return response.data;
};

export const createProject = async (data: {
  title: string;
  description?: string;
  courseId?: number;
  startDate: string;
  endDate?: string;
  tags?: string;
}) => {
  const response = await axiosInstance.post("/projects", data);
  return response.data;
};

export const updateProject = async (
  id: number,
  data: Partial<{
    title: string;
    description: string;
    endDate: string;
    tags: string;
  }>
) => {
  const response = await axiosInstance.put(`/projects/${id}`, data);
  return response.data;
};

export const updateProjectStatus = async (id: number, status: string) => {
  const response = await axiosInstance.patch(`/projects/${id}/status`, {
    status,
  });
  return response.data;
};

export const assignSupervisor = async (
  id: number,
  supervisorId: number
) => {
  const response = await axiosInstance.patch(`/projects/${id}/supervisor`, {
    supervisorId,
  });
  return response.data;
};

export const deleteProject = async (id: number) => {
  const response = await axiosInstance.delete(`/projects/${id}`);
  return response.data;
};
