import axiosInstance from "../../../services/axios";

export interface OverviewStats {
  totalStudents: number;
  totalProjects: number;
  totalReports: number;
  totalPlagiarismChecks: number;
  totalFeedback: number;
  totalRagQueries: number;
}

export const getOverviewStats = async (): Promise<OverviewStats> => {
  const response = await axiosInstance.get("/stats/overview");
  return response.data;
};
