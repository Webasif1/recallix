// src/components/PublicRoute.jsx
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PublicRoute = ({ children }) => {
  // Inside PublicRoute or ProtectedRoute
const { user, loading } = useSelector((state) => state.auth);

if (loading) return <div className="...">Loading...</div>;

  // If user is logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;
