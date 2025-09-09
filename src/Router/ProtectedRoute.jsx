import { Navigate } from "react-router-dom";
import { message } from "antd";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("jwt_token");

  if (!token) {
    message.error("Vui lòng đăng nhập để tiếp tục!");
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
