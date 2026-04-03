import axiosInstance from "../../../services/axios";

export interface Milestone {
  id: number;
  project_id: number;
  milestone: string;
  description: string | null;
  status: string;
  order_index: number;
  due_date: string | null;
  created_at: string;
}

export const listMilestones = async (
  projectId: number
): Promise<Milestone[]> => {
  const response = await axiosInstance.get(
    `/milestones/project/${projectId}`
  );
  return response.data.items;
};

export const createMilestone = async (
  projectId: number,
  data: {
    milestone: string;
    description?: string;
    orderIndex?: number;
    dueDate?: string;
  }
) => {
  const response = await axiosInstance.post(
    `/milestones/project/${projectId}`,
    data
  );
  return response.data;
};

export const bulkCreateMilestones = async (
  projectId: number,
  milestones: Array<{
    milestone: string;
    description?: string;
    orderIndex?: number;
    dueDate?: string;
  }>
) => {
  const response = await axiosInstance.post(
    `/milestones/project/${projectId}/bulk`,
    { milestones }
  );
  return response.data;
};

export const updateMilestone = async (
  id: number,
  data: Partial<{
    milestone: string;
    description: string;
    orderIndex: number;
    dueDate: string;
  }>
) => {
  const response = await axiosInstance.put(`/milestones/${id}`, data);
  return response.data;
};

export const updateMilestoneStatus = async (id: number, status: string) => {
  const response = await axiosInstance.patch(`/milestones/${id}/status`, {
    status,
  });
  return response.data;
};

export const deleteMilestone = async (id: number) => {
  const response = await axiosInstance.delete(`/milestones/${id}`);
  return response.data;
};
