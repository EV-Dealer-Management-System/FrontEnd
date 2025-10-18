import React from "react";
import { Card, Row, Col, Select, DatePicker, Input, Button, Space } from "antd";
import {
    SearchOutlined,
    ReloadOutlined,
    FilterOutlined,
    ClearOutlined,
} from "@ant-design/icons";

const { RangePicker } = DatePicker;

function BookingFilters({
    searchText,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    dateRange,
    onDateRangeChange,
    onReset,
    onReload,
    loading,
}) {
    // Danh sách trạng thái booking
    const statusOptions = [
        { label: "Tất cả trạng thái", value: "all" },
        { label: "Chờ xác nhận", value: "pending" },
        { label: "Đã phê duyệt", value: "approved" },
        { label: "Đã từ chối", value: "rejected" },
        { label: "Đã hủy", value: "cancelled" },
        { label: "Hoàn thành", value: "completed" },
    ];

    return (
        <Row gutter={[16, 16]} align="middle">
            {/* Thanh tìm kiếm */}
            <Col xs={24} md={12} lg={12}>
                <Input
                    placeholder="Tìm kiếm theo mã booking, dealer, người tạo..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => onSearchChange(e.target.value)}
                    allowClear
                    size="large"
                />
            </Col>

            {/* Lọc theo khoảng thời gian */}
            <Col xs={24} sm={12} md={6} lg={8}>
                <RangePicker
                    value={dateRange}
                    onChange={onDateRangeChange}
                    format="DD/MM/YYYY"
                    placeholder={["Từ ngày", "Đến ngày"]}
                    className="w-full"
                    size="large"
                />
            </Col>

            {/* Các nút action */}
            <Col xs={24} md={6} lg={4}>
                <Space className="w-full" style={{ justifyContent: "flex-end" }}>
                    <Button
                        icon={<ClearOutlined />}
                        onClick={onReset}
                        disabled={!searchText && !dateRange}
                        size="large"
                    >
                        Xóa
                    </Button>
                    <Button
                        type="primary"
                        icon={<ReloadOutlined spin={loading} />}
                        onClick={onReload}
                        loading={loading}
                        size="large"
                    >
                        Tải lại
                    </Button>
                </Space>
            </Col>
        </Row>
    );
}

export default BookingFilters;
