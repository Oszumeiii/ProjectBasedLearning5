export interface Assignment {
  id: number;
  courseId: number;
  title: string;
  description: string;
  deadline: string;
  maxScore: number;
  createdAt: string;
  createdBy: string;
  type: "report" | "exercise" | "project" | "quiz";
  attachments: Array<{ name: string; size: string }>;
  submissions: AssignmentSubmission[];
}

export interface AssignmentSubmission {
  id: number;
  assignmentId: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  submittedAt: string | null;
  status: "not_submitted" | "submitted" | "late" | "graded";
  score: number | null;
  feedback: string | null;
  fileName: string | null;
  fileSize: string | null;
}

export interface ClassPost {
  id: number;
  courseId: number;
  authorName: string;
  authorRole: "lecturer" | "student";
  content: string;
  createdAt: string;
  isPinned: boolean;
  attachments: Array<{ name: string; size: string }>;
  comments: Array<{
    id: number;
    authorName: string;
    authorRole: "lecturer" | "student";
    content: string;
    createdAt: string;
  }>;
}

const now = new Date();
const daysAgo = (d: number) =>
  new Date(now.getTime() - d * 86400000).toISOString();
const daysLater = (d: number) =>
  new Date(now.getTime() + d * 86400000).toISOString();

const STUDENTS = [
  { id: 1, name: "Nguyen Van A", email: "sv04@gmail.vn" },
  { id: 2, name: "Nguyen Van G", email: "sv05@gmail.vn" },
  { id: 3, name: "Tran Thi B", email: "sv06@gmail.vn" },
  { id: 4, name: "Le Van C", email: "sv07@gmail.vn" },
  { id: 5, name: "Pham Thi D", email: "sv08@gmail.vn" },
  { id: 6, name: "Hoang Van E", email: "sv09@gmail.vn" },
  { id: 7, name: "Vo Thi F", email: "sv10@gmail.vn" },
  { id: 8, name: "Dang Van H", email: "sv11@gmail.vn" },
  { id: 9, name: "Bui Thi I", email: "sv12@gmail.vn" },
  { id: 10, name: "Ngo Van K", email: "sv13@gmail.vn" },
];

export const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: 1,
    courseId: 1,
    title: "Báo cáo tiến độ Sprint 1",
    description:
      "Nộp báo cáo tiến độ Sprint 1 bao gồm: phân tích yêu cầu, thiết kế cơ sở dữ liệu, mockup giao diện. Yêu cầu định dạng PDF, tối đa 20 trang.",
    deadline: daysAgo(2),
    maxScore: 10,
    createdAt: daysAgo(14),
    createdBy: "TS. Nguyễn Minh Khoa",
    type: "report",
    attachments: [
      { name: "Mau_bao_cao_Sprint1.docx", size: "245 KB" },
      { name: "Huong_dan_viet_bao_cao.pdf", size: "1.2 MB" },
    ],
    submissions: STUDENTS.map((s, i) => ({
      id: 100 + i,
      assignmentId: 1,
      studentId: s.id,
      studentName: s.name,
      studentEmail: s.email,
      submittedAt: i < 8 ? daysAgo(3 + Math.floor(Math.random() * 5)) : null,
      status:
        i < 5
          ? ("graded" as const)
          : i < 8
            ? ("submitted" as const)
            : ("not_submitted" as const),
      score: i < 5 ? 7 + Math.floor(Math.random() * 3) : null,
      feedback: i < 5 ? "Tốt. Cần bổ sung phần phân tích rủi ro." : null,
      fileName: i < 8 ? `BaoCao_Sprint1_${s.name.replace(/ /g, "_")}.pdf` : null,
      fileSize: i < 8 ? `${(1 + Math.random() * 3).toFixed(1)} MB` : null,
    })),
  },
  {
    id: 2,
    courseId: 1,
    title: "Đề cương nghiên cứu",
    description:
      "Viết đề cương nghiên cứu cho đồ án bao gồm: mục tiêu, phạm vi, phương pháp nghiên cứu, kế hoạch thực hiện. Nộp file PDF.",
    deadline: daysLater(3),
    maxScore: 10,
    createdAt: daysAgo(5),
    createdBy: "TS. Nguyễn Minh Khoa",
    type: "report",
    attachments: [
      { name: "Template_De_Cuong.docx", size: "180 KB" },
    ],
    submissions: STUDENTS.map((s, i) => ({
      id: 200 + i,
      assignmentId: 2,
      studentId: s.id,
      studentName: s.name,
      studentEmail: s.email,
      submittedAt: i < 3 ? daysAgo(1) : null,
      status: i < 3 ? ("submitted" as const) : ("not_submitted" as const),
      score: null,
      feedback: null,
      fileName: i < 3 ? `DeCuong_${s.name.replace(/ /g, "_")}.pdf` : null,
      fileSize: i < 3 ? `${(0.5 + Math.random() * 2).toFixed(1)} MB` : null,
    })),
  },
  {
    id: 3,
    courseId: 1,
    title: "Báo cáo giữa kỳ",
    description:
      "Báo cáo giữa kỳ trình bày tiến độ dự án: kiến trúc hệ thống, demo chức năng chính, kế hoạch Sprint tiếp theo. Bao gồm slide thuyết trình và báo cáo chi tiết.",
    deadline: daysLater(14),
    maxScore: 20,
    createdAt: daysAgo(1),
    createdBy: "TS. Nguyễn Minh Khoa",
    type: "project",
    attachments: [],
    submissions: STUDENTS.map((s, i) => ({
      id: 300 + i,
      assignmentId: 3,
      studentId: s.id,
      studentName: s.name,
      studentEmail: s.email,
      submittedAt: null,
      status: "not_submitted" as const,
      score: null,
      feedback: null,
      fileName: null,
      fileSize: null,
    })),
  },
  {
    id: 4,
    courseId: 1,
    title: "Bài tập: Thiết kế ERD",
    description:
      "Thiết kế Entity Relationship Diagram cho hệ thống quản lý thư viện. Export file ảnh PNG hoặc PDF từ công cụ draw.io hoặc dbdiagram.io.",
    deadline: daysAgo(7),
    maxScore: 5,
    createdAt: daysAgo(21),
    createdBy: "TS. Nguyễn Minh Khoa",
    type: "exercise",
    attachments: [
      { name: "Yeu_cau_he_thong_thu_vien.pdf", size: "340 KB" },
    ],
    submissions: STUDENTS.map((s, i) => ({
      id: 400 + i,
      assignmentId: 4,
      studentId: s.id,
      studentName: s.name,
      studentEmail: s.email,
      submittedAt: daysAgo(8 + Math.floor(Math.random() * 5)),
      status: "graded" as const,
      score: 3 + Math.floor(Math.random() * 3),
      feedback:
        i % 2 === 0
          ? "ERD rõ ràng, quan hệ chính xác."
          : "Cần bổ sung bảng mượn trả sách.",
      fileName: `ERD_${s.name.replace(/ /g, "_")}.pdf`,
      fileSize: `${(0.2 + Math.random()).toFixed(1)} MB`,
    })),
  },
];

export const MOCK_POSTS: ClassPost[] = [
  {
    id: 1,
    courseId: 1,
    authorName: "TS. Nguyễn Minh Khoa",
    authorRole: "lecturer",
    content:
      "Chào mừng các bạn đến với lớp Dự án Cơ sở ngành CNTT! Các bạn vui lòng đọc kỹ đề cương môn học và lịch trình trong file đính kèm. Mọi thắc mắc xin hỏi trực tiếp tại đây.",
    createdAt: daysAgo(30),
    isPinned: true,
    attachments: [
      { name: "De_cuong_mon_hoc_2026.pdf", size: "1.5 MB" },
      { name: "Lich_trinh_hoc_tap.xlsx", size: "45 KB" },
    ],
    comments: [
      {
        id: 1,
        authorName: "Nguyen Van A",
        authorRole: "student",
        content: "Dạ em đã đọc. Cảm ơn thầy ạ!",
        createdAt: daysAgo(29),
      },
      {
        id: 2,
        authorName: "Tran Thi B",
        authorRole: "student",
        content: "Thầy ơi, nhóm tối đa bao nhiêu người ạ?",
        createdAt: daysAgo(29),
      },
      {
        id: 3,
        authorName: "TS. Nguyễn Minh Khoa",
        authorRole: "lecturer",
        content: "Nhóm tối đa 5 người nhé.",
        createdAt: daysAgo(28),
      },
    ],
  },
  {
    id: 2,
    courseId: 1,
    authorName: "TS. Nguyễn Minh Khoa",
    authorRole: "lecturer",
    content:
      "THÔNG BÁO: Deadline nộp đề cương nghiên cứu còn 3 ngày. Các bạn chưa nộp vui lòng hoàn thành sớm. Nộp muộn sẽ bị trừ 2 điểm/ngày.",
    createdAt: daysAgo(1),
    isPinned: false,
    attachments: [],
    comments: [
      {
        id: 4,
        authorName: "Le Van C",
        authorRole: "student",
        content: "Dạ em sẽ nộp trong hôm nay ạ.",
        createdAt: daysAgo(0),
      },
    ],
  },
  {
    id: 3,
    courseId: 1,
    authorName: "TS. Nguyễn Minh Khoa",
    authorRole: "lecturer",
    content:
      "Kết quả chấm bài Sprint 1 đã có. Các bạn kiểm tra điểm và phản hồi trong phần Bài tập. Nếu có thắc mắc về điểm, liên hệ trực tiếp.",
    createdAt: daysAgo(2),
    isPinned: false,
    attachments: [],
    comments: [],
  },
  {
    id: 4,
    courseId: 1,
    authorName: "Nguyen Van A",
    authorRole: "student",
    content:
      "Các bạn ơi có ai biết cách deploy Next.js lên Vercel không? Nhóm mình đang bị lỗi build khi deploy.",
    createdAt: daysAgo(3),
    isPinned: false,
    attachments: [],
    comments: [
      {
        id: 5,
        authorName: "Pham Thi D",
        authorRole: "student",
        content: "Bạn thử check lại file next.config.js xem, có thể do output config.",
        createdAt: daysAgo(3),
      },
      {
        id: 6,
        authorName: "Hoang Van E",
        authorRole: "student",
        content: "Nhóm mình cũng bị, đổi sang output: 'standalone' là được.",
        createdAt: daysAgo(2),
      },
    ],
  },
];

export const getAssignmentsByCourse = (courseId: number): Assignment[] =>
  MOCK_ASSIGNMENTS.filter((a) => a.courseId === courseId);

export const getAssignmentById = (id: number): Assignment | undefined =>
  MOCK_ASSIGNMENTS.find((a) => a.id === id);

export const getPostsByCourse = (courseId: number): ClassPost[] =>
  MOCK_POSTS.filter((p) => p.courseId === courseId);

export const getAssignmentStats = (assignment: Assignment) => {
  const total = assignment.submissions.length;
  const submitted = assignment.submissions.filter(
    (s) => s.status !== "not_submitted"
  ).length;
  const graded = assignment.submissions.filter(
    (s) => s.status === "graded"
  ).length;
  const late = assignment.submissions.filter(
    (s) => s.status === "late"
  ).length;
  const isOverdue = new Date(assignment.deadline) < new Date();
  const avgScore =
    graded > 0
      ? assignment.submissions
          .filter((s) => s.score !== null)
          .reduce((sum, s) => sum + (s.score || 0), 0) / graded
      : null;

  return { total, submitted, graded, late, isOverdue, avgScore };
};
