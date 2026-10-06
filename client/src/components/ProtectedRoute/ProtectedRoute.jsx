import { Navigate } from "react-router-dom";
import { getSession } from "../../services/authAPI";

export default function ProtectedRoute({ role, children }) {
  const session = getSession();
  if (!session || session.user.role !== role) return <Navigate to={`/${role}/signin`} replace />;
  return children;
}
