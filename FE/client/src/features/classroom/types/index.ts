export interface Course {
  id: number;
  name: string;
  description?: string;
  lecturer_id: number;
  lecturer_name: string;
  lecturer_email: string;
  student_count: number;
  created_at: string;
  enrolled_at?: string; // Chỉ có khi student xem lớp đã tham gia
}

export interface CourseDetail extends Course {
  students: Array<{
    id: number;
    full_name: string;
    email: string;
    major: string;
    enrolled_at: string;
  }>;
  report_count: number;
}

export interface CourseResponse {
  items: Course[];
}
