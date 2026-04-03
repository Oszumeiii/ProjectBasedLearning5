import { AuthProvider } from "./features/auth/context/AuthContext";
import { AccessControlProvider } from "./context/AccessControlContext";
import { AssignmentProvider } from "./context/AssignmentContext";
import { AppRouter } from "./routes";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <AccessControlProvider>
        <AssignmentProvider>
          <AppRouter />
        </AssignmentProvider>
      </AccessControlProvider>
    </AuthProvider>
  );
}

export default App;
