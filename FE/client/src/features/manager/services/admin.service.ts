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

/** Import sinh viên từ CSV — backend gửi email kích hoạt tài khoản (SMTP). */
export interface ImportStudentsResult {
  batchId: number;
  batchType: string;
  totalRows: number;
  success: number;
  failed: number;
  skipped: number;
  emailsSent: number;
  errors?: Array<{ row: number; email: string; reason: string }>;
}

export const importStudentsFromCsv = async (file: File, semester?: string) => {
  const fd = new FormData();
  fd.append("file", file);
  if (semester?.trim()) fd.append("semester", semester.trim());
  const response = await axiosInstance.post<ImportStudentsResult>(
    "/admin/import-students",
    fd,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export interface ImportBatchRow {
  id: number;
  imported_by_name: string;
  file_name: string;
  batch_type: string;
  semester: string | null;
  total_rows: number;
  success_rows: number;
  failed_rows: number;
  skipped_rows: number;
  status: string;
  imported_at: string;
}

export const listImportBatches = async () => {
  const response = await axiosInstance.get<{ items: ImportBatchRow[] }>(
    "/admin/import-batches"
  );
  return response.data.items;
};

export const resendActivationEmail = async (email: string) => {
  const response = await axiosInstance.post<{ message: string }>(
    "/admin/resend-activation",
    { email }
  );
  return response.data;
};
