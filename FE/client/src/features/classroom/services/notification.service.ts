import axiosInstance from "../../../services/axios";

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  related_id: number | null;
  related_type: string | null;
  created_at: string;
}

export const listNotifications = async (params?: {
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
}) => {
  const response = await axiosInstance.get("/notifications", { params });
  return response.data;
};

export const markAsRead = async (id: number) => {
  const response = await axiosInstance.patch(`/notifications/${id}/read`);
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await axiosInstance.patch("/notifications/read-all");
  return response.data;
};

export const deleteNotification = async (id: number) => {
  const response = await axiosInstance.delete(`/notifications/${id}`);
  return response.data;
};
