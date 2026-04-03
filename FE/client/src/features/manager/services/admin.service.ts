import axiosInstance from "../../../services/axios";

export interface AdminUserRow {
  id: number;
  full_name: string;
  email: string;
  role: string;
  student_code: string | null;
  class_name: string | null;
  major: string | null;
  department: string | null;
  account_status: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

export interface ListUsersParams {
  role?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const listAdminUsers = async (params?: ListUsersParams) => {
  const response = await axiosInstance.get<{
    items: AdminUserRow[];
    page: number;
    limit: number;
    total: number;
  }>("/admin/users", { params });
  return response.data;
};

export const updateUserAccountStatus = async (
  userId: number,
  accountStatus: string
) => {
  const response = await axiosInstance.patch(`/admin/users/${userId}/status`, {
    accountStatus,
  });
  return response.data;
};
