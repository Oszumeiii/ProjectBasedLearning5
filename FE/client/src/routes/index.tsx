import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import LoginPage from "../features/auth/pages/LoginPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />, // Tự động chuyển hướng root về dashboard
  },
  {
    path: "/dashboard",
    element: <DashboardPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "*",
    element: (
      <div className="flex h-screen items-center justify-center">
        404 - Không tìm thấy trang
      </div>
    ),
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
