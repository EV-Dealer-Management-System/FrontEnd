import React from "react";
import { Space, Badge, Dropdown, Avatar } from "antd";
import {
    BellOutlined,
    UserOutlined,
    LogoutOutlined,
    SettingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

function HeaderBar({ collapsed, isMobile }) {
    const navigate = useNavigate();
    const userFullName = localStorage.getItem("userFullName") || "EVM Staff";

    const handleLogout = () => {
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("user");
        localStorage.removeItem("userFullName");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("refresh_token");
        navigate("/");
    };

    const userMenuItems = [
        {
            key: "profile",
            icon: <UserOutlined />,
            label: "Thông tin cá nhân",
            onClick: () => navigate("/evm-staff/profile"),
        },
        {
            key: "settings",
            icon: <SettingOutlined />,
            label: "Cài đặt",
            onClick: () => navigate("/evm-staff/settings/change-password"),
        },
        {
            type: "divider",
        },
        {
            key: "logout",
            icon: <LogoutOutlined />,
            label: "Đăng xuất",
            onClick: handleLogout,
            danger: true,
        },
    ];

    const headerStyle = {
        position: 'fixed',
        top: 0,
        right: 0,
        left: isMobile ? 0 : collapsed ? 64 : 280,
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingRight: '24px',
        backgroundColor: 'white',
        borderBottom: '1px solid #d9d9d9',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
        transition: 'left 0.2s ease',
        zIndex: 30,
    };
    return (
        <div style={headerStyle}>
            {/* Right side only - Notification + Email + Avatar + Language */}
            <Space size="large" align="center">
                <span className="text-sm text-gray-600">Chào, {userFullName}</span>
                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                    <Avatar
                        className="cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
                        style={{ backgroundColor: "#1890ff" }}
                        icon={<UserOutlined />}
                    />
                </Dropdown>
            </Space>
        </div>
    );
}

export default HeaderBar;
