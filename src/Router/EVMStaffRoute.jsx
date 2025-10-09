import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function EVMStaffRoute({ children }) {
    const token = localStorage.getItem('jwt_token');

    if (!token) {
        // Nếu không có token, chuyển về trang login
        return <Navigate to="/" replace />;
    }

    try {
        const decodedToken = jwtDecode(token);
        const userRole = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

        if (userRole !== 'EVMStaff') {
            // Nếu không phải EVMStaff, chuyển về trang tương ứng với role
            switch (userRole) {
                case 'Admin':
                    return <Navigate to="/admin" replace />;
                case 'DealerManager':
                    return <Navigate to="/dealer-manager" replace />;
                case 'DealerStaff':
                    return <Navigate to="/dealer-staff" replace />;
                default:
                    return <Navigate to="/" replace />;
            }
        }

        // Kiểm tra token hết hạn
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp < currentTime) {
            // Token đã hết hạn
            localStorage.removeItem('jwt_token');
            return <Navigate to="/" replace />;
        }

        return children;
    } catch (error) {
        // Nếu có lỗi giải mã token, giữ nguyên token và chuyển về trang chủ của EVMStaff
        console.error('Lỗi khi giải mã token:', error);
        return <Navigate to="/evm-staff" replace />;
    }
}

export default EVMStaffRoute;