import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function getRoleFromToken(token) {
  try {
    const d = jwtDecode(token);
    return (
      d["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      d.role ||
      (Array.isArray(d.roles) ? d.roles[0] : undefined)
    );
  } catch {
    return undefined;
  }
}

function roleToHome(role) {
  switch (role) {
    case "Admin":         return "/admin";
    case "DealerManager": return "/dealer-manager";
    case "DealerStaff":   return "/dealer-staff";
    case "EVMStaff":      return "/evm-staff";
    default:              return "/"; // or show a generic dashboard if you have one
  }
}

export default function PublicRoute({ children }) {
  const token = localStorage.getItem("jwt_token");
  if (token) {
    const role = getRoleFromToken(token);
    const home = roleToHome(role);
    return <Navigate to={home} replace />;
  }
  // allow public page to render
  return children ?? <Outlet />;
}
