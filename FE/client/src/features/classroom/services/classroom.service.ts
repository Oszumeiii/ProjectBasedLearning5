import axios from "../../../services/axios";
import { CourseResponse, CourseDetail } from "../types";

const API_URL = "/courses";

export const classroomService = {
  /**
   * 1. Lấy danh sách lớp chung (Admin/Manager/Lecturer)
   * Trả về: { items: Course[] }
   */
  getListCourses: async (): Promise<CourseResponse> => {
    const response = await axios.get<CourseResponse>(`${API_URL}`);
    return response.data;
  },

  /**
   * 2. Lấy danh sách lớp mà Student đã tham gia
   * Endpoint thực tế trong BE: GET /api/courses/my/enrollments
   * Trả về: { items: Course[] }
   */
  getMyEnrollments: async (): Promise<CourseResponse> => {
    const response = await axios.get<CourseResponse>(
      `${API_URL}/my/enrollments`,
    );
    return response.data;
  },

  /**
   * 3. Chi tiết lớp học phần (Dành cho ClassroomDetailPage)
   * Trả về: CourseDetail (Chứa thêm students[], student_count, report_count)
   */
  getCourseDetails: async (id: number): Promise<CourseDetail> => {
    const response = await axios.get<CourseDetail>(`${API_URL}/${id}`);
    return response.data;
  },

  /**
   * 4. Tham gia lớp học bằng mã Enrollment Code
   * Endpoint thực tế trong BE: POST /api/courses/join
   * Payload: { courseCode: string }
   */
  joinCourseByCode: async (code: string): Promise<{ message: string }> => {
    // Sửa lại endpoint thành "/join" để khớp với logic xử lý mã tham gia trong Controller của bạn
    const response = await axios.post(`${API_URL}/join`, {
      courseCode: code,
    });
    return response.data;
  },
};
