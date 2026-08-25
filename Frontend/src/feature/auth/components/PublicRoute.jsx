import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import RouteSplash from "./RouteSplash";

/**
 * Gate for signed-out routes (landing, login, register).
 * A signed-in user gets sent straight to their dashboard.
 */
const PublicRoute = ({ children }) => {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) return <RouteSplash label="Checking your session…" />;

  if (user) return <Navigate to="/dashboard" replace />;

  return children;
};

export default PublicRoute;
