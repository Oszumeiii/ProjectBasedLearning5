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
import ActivationPage from "../features/auth/pages/ActivationPage";

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
  { path: "/activate", element: <ActivationPage /> },

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
      <div className="flex h-screen items-center justify-center bg-app font-sans text-ink-muted">
        <div className="text-center">
          <h1 className="mb-4 font-headline text-6xl font-bold text-brand">404</h1>
          <p className="text-lg text-ink-body">Không tìm thấy trang yêu cầu.</p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-full bg-brand px-6 py-2 font-semibold text-white shadow-whisper transition-colors hover:bg-brand-hover"
          >
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    ),
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
