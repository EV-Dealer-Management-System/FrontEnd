import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChangePassword from './src/Pages/Admin/ChangePassword/ChangePassword';
import 'antd/dist/reset.css';

function App() {
    // Mock user data for demo
    React.useEffect(() => {
        const mockUser = {
            id: 1,
            name: 'Admin User',
            email: 'admin@example.com',
            role: 'admin'
        };
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('jwt_token', 'mock-jwt-token');
    }, []);

    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<ChangePassword />} />
                    <Route path="/change-password" element={<ChangePassword />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;