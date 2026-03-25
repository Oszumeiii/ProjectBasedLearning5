// src/routes/index.tsx (hoặc AppRouter.tsx)
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage";
import { StudentLayout } from "../layouts/StudentLayout"; // Import Layout tổng thể
import { StudentLobbyPage } from "../features/classroom/pages/StudentLobbyPage"; // Import trang Lobby
import { ClassroomDetailPage } from "../features/classroom/pages/ClassroomDetailPage"; // Import trang Classroom Detail
import { AssignmentSubmissionPage } from "../features/classroom/pages/AssignmentSubmissionPage"; // Import trang Assignment Submission
import { AcademicLibraryPage } from "../features/classroom/pages/AcademicLibraryPage"; // Import trang Material Library
import { AnalysisFeedbackPage } from "../features/classroom/pages/AnalysisFeedbackPage"; // Import trang Feedback (nếu có)
const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },

  // --- NHÓM ROUTE CỦA STUDENT ---
  // Tất cả các route bên trong này sẽ được bọc bởi StudentLayout
  {
    path: "/student",
    element: <StudentLayout />,
    children: [
      {
        index: true, // Path mặc định khi vào /student
        element: <Navigate to="lobby" replace />,
      },
      {
        path: "lobby",
        element: <StudentLobbyPage />,
      },
      {
        path: "class/:classId", // :classId là id động để biết đang vào lớp nào
        element: <ClassroomDetailPage />,
      },
      {
        path: "assignment", // :assignmentId là id động để biết đang vào bài tập nào
        element: <AssignmentSubmissionPage />,
      },
      {
        path: "library", // Thư viện tài liệu chung của lớp
        element: <AcademicLibraryPage />,
      },
      {
        path: "feedback",
        element: <AnalysisFeedbackPage />,
      },
      // Sau này bạn thêm các trang khác của sinh viên ở đây:
      // { path: "classroom/:id", element: <ClassroomPage /> },
      // { path: "assignments", element: <AssignmentsPage /> },
    ],
  },
  // ------------------------------

  {
    path: "*",
    element: (
      <div className="flex h-screen items-center justify-center text-slate-400 bg-[#0b1326]">
        404 - Không tìm thấy trang
      </div>
    ),
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
