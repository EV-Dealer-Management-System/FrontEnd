import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("jwt_token");

  if (token) {
    // If user is logged in, redirect to customer dashboard
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default PublicRoute;
