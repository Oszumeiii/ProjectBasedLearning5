import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Link,
} from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute";

// Layouts
import { StudentLayout } from "../layouts/StudentLayout";
import InstructorLayout from "../layouts/InstructorLayout";
import ManagerLayout from "../layouts/ManagerLayout";

// Auth Pages
import LoginPage from "../features/auth/pages/LoginPage";

// Student Pages
import { StudentLobbyPage } from "../features/classroom/pages/StudentLobbyPage";
import { ClassroomDetailPage } from "../features/classroom/pages/ClassroomDetailPage";
import { AssignmentSubmissionPage } from "../features/classroom/pages/AssignmentSubmissionPage";
import { AcademicLibraryPage } from "../features/classroom/pages/AcademicLibraryPage";
import { AnalysisFeedbackPage } from "../features/classroom/pages/AnalysisFeedbackPage";

// Instructor Pages
import { InstructorLobbyPage } from "../features/instructor/pages/InstructorLobbyPage";
import { InstructorClassroomPage } from "../features/instructor/pages/InstructorClassroomPage";
import { InstructorGradingPage } from "../features/instructor/pages/InstructorGradingPage";
import { InstructorGradingDetailPage } from "../features/instructor/pages/InstructorGradingDetailPage";
import { SchedulePage } from "../features/instructor/pages/InstructorSchedulePage";

// Manager Pages
import { ManagerLobbyPage } from "../features/manager/pages/ManagerLobbyPage";
import { ManagerCoursesPage } from "../features/manager/pages/ManagerCoursesPage";
import { ManagerReportsPage } from "../features/manager/pages/ManagerReportsPage";
import { AdminUsersPage } from "../features/manager/pages/AdminUsersPage";
import { AdminAccessControlPage } from "../features/manager/pages/AdminAccessControlPage";
import { StudentImportPage } from "../features/manager/pages/StudentImportPage";
import { ManagerCourseDetailPage } from "../features/manager/pages/ManagerCourseDetailPage";

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <LoginPage /> },

  // STUDENT
  {
    element: <ProtectedRoute allowedRoles={["student"]} />,
    children: [
      {
        path: "/student",
        element: <StudentLayout />,
        children: [
          { index: true, element: <Navigate to="lobby" replace /> },
          { path: "lobby", element: <StudentLobbyPage /> },
          { path: "class/:classId", element: <ClassroomDetailPage /> },
          { path: "class/:classId/submit", element: <AssignmentSubmissionPage /> },
          { path: "library", element: <AcademicLibraryPage /> },
          { path: "feedback", element: <AnalysisFeedbackPage /> },
        ],
      },
    ],
  },

  // INSTRUCTOR (LECTURER)
  {
    element: <ProtectedRoute allowedRoles={["lecturer"]} />,
    children: [
      {
        path: "/instructor",
        element: <InstructorLayout />,
        children: [
          { index: true, element: <Navigate to="lobby" replace /> },
          { path: "lobby", element: <InstructorLobbyPage /> },
          { path: "courses", element: <ManagerCoursesPage /> },
          { path: "courses/:courseId", element: <ManagerCourseDetailPage /> },
          { path: "class/:courseId", element: <InstructorClassroomPage /> },
          { path: "grading", element: <InstructorGradingPage /> },
          { path: "grading-detail", element: <InstructorGradingDetailPage /> },
          { path: "schedule", element: <SchedulePage /> },
        ],
      },
    ],
  },

  // MANAGER
  {
    element: <ProtectedRoute allowedRoles={["manager"]} />,
    children: [
      {
        path: "/manager",
        element: <ManagerLayout />,
        children: [
          { index: true, element: <Navigate to="lobby" replace /> },
          { path: "lobby", element: <ManagerLobbyPage /> },
          { path: "courses", element: <ManagerCoursesPage /> },
          { path: "courses/:courseId", element: <ManagerCourseDetailPage /> },
          { path: "reports", element: <ManagerReportsPage /> },
          { path: "users", element: <AdminUsersPage /> },
          { path: "access", element: <AdminAccessControlPage /> },
          { path: "import-students", element: <StudentImportPage /> },
        ],
      },
    ],
  },

  // ADMIN
  {
    element: <ProtectedRoute allowedRoles={["admin"]} />,
    children: [
      {
        path: "/admin",
        element: <ManagerLayout />,
        children: [
          { index: true, element: <Navigate to="lobby" replace /> },
          { path: "lobby", element: <ManagerLobbyPage /> },
          { path: "courses", element: <ManagerCoursesPage /> },
          { path: "courses/:courseId", element: <ManagerCourseDetailPage /> },
          { path: "reports", element: <ManagerReportsPage /> },
          { path: "users", element: <AdminUsersPage /> },
          { path: "access", element: <AdminAccessControlPage /> },
          { path: "import-students", element: <StudentImportPage /> },
        ],
      },
    ],
  },

  // 404
  {
    path: "*",
    element: (
      <div className="flex h-screen items-center justify-center text-slate-400 bg-[#0b1326] font-manrope">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-indigo-500 mb-4">404</h1>
          <p className="text-lg">Không tìm thấy trang yêu cầu.</p>
          <Link
            to="/"
            className="mt-6 inline-block px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
          >
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    ),
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
