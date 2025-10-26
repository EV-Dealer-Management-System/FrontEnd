import React, { useState, useEffect } from "react";
import {
  PageContainer,
  ProTable,
  StatisticCard,
} from "@ant-design/pro-components";
import { Card, message, Tag, Avatar, Row, Col, Space } from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  UserAddOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import { getAllEVCustomer } from "../../../App/DealerStaff/EVCustomerManagement/GetAllEVCustomer";
import dayjs from "dayjs";
import DealerStaffLayout from "../../../Components/DealerStaff/DealerStaffLayout";

const { Statistic } = StatisticCard;

function GetAllEVCustomer() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch customers data
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const data = await getAllEVCustomer();
        if (data.isSuccess) {
          setCustomers(data.result);
        } else {
          message.error("Không thể tải dữ liệu khách hàng");
        }
      } catch (err) {
        console.error("Error fetching customers:", err);
        message.error("Lỗi khi tải dữ liệu khách hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Tính toán thống kê
  const stats = {
    total: customers.length,
    newToday: customers.filter((c) =>
      dayjs(c.createdAt).isAfter(dayjs().startOf("day"))
    ).length,
    newThisWeek: customers.filter((c) =>
      dayjs(c.createdAt).isAfter(dayjs().startOf("week"))
    ).length,
  };

  // Define table columns
  const columns = [
    {
      title: "Khách Hàng",
      dataIndex: "fullName",
      key: "fullName",
      render: (text) => (
        <Space>
          <Avatar
            size="small"
            style={{
              backgroundColor: "#1890ff",
            }}
            icon={<UserOutlined />}
          />
          <span className="font-medium text-gray-800">{text}</span>
        </Space>
      ),
    },
    {
      title: "Số Điện Thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      render: (phone) => (
        <Space size="small">
          <PhoneOutlined className="text-green-600" />
          <span>{phone}</span>
        </Space>
      ),
    },
    {
      title: "Địa Chỉ",
      dataIndex: "address",
      key: "address",
      ellipsis: {
        showTitle: false,
      },
      render: (address) => (
        <Space size={4} style={{ width: "100%" }}>
          <EnvironmentOutlined className="text-red-500" />
          <span className="text-gray-600" title={address}>
            {address}
          </span>
        </Space>
      ),
    },
    {
      title: "Ngày Đăng Ký",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      render: (date) => {
        const isNew = dayjs(date).isAfter(dayjs().subtract(7, "days"));
        return (
          <Space direction="vertical" size={0}>
            <span className="text-gray-800">
              {dayjs(date).format("DD/MM/YYYY HH:mm")}
            </span>
            {isNew && <Tag color="green">Mới</Tag>}
          </Space>
        );
      },
    },
    {
      title: "Ghi Chú",
      dataIndex: "note",
      key: "note",
      ellipsis: {
        showTitle: false,
      },
      render: (note) => (
        <span
          className="text-gray-600 italic"
          title={note || "Không có ghi chú"}
        >
          {note || "-"}
        </span>
      ),
    },
  ];

  return (
    <DealerStaffLayout>
      <PageContainer
        title="Quản Lý Khách Hàng"
        subTitle="Hệ thống quản lý khách hàng xe máy điện"
        className="bg-gradient-to-br from-blue-50 to-indigo-50"
      >
        {/* Thống kê tổng quan */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={8}>
            <StatisticCard
              statistic={{
                title: "Tổng Khách Hàng",
                value: stats.total,
                icon: (
                  <TeamOutlined
                    style={{
                      fontSize: 40,
                      color: "#1890ff",
                    }}
                  />
                ),
              }}
              className="shadow-sm hover:shadow-md transition-shadow"
            />
          </Col>
          <Col xs={24} sm={8}>
            <StatisticCard
              statistic={{
                title: "Khách Hàng Mới Hôm Nay",
                value: stats.newToday,
                icon: (
                  <UserAddOutlined
                    style={{
                      fontSize: 40,
                      color: "#52c41a",
                    }}
                  />
                ),
              }}
              className="shadow-sm hover:shadow-md transition-shadow"
            />
          </Col>
          <Col xs={24} sm={8}>
            <StatisticCard
              statistic={{
                title: "Khách Hàng Tuần Này",
                value: stats.newThisWeek,
                icon: (
                  <SmileOutlined
                    style={{
                      fontSize: 40,
                      color: "#faad14",
                    }}
                  />
                ),
              }}
              className="shadow-sm hover:shadow-md transition-shadow"
            />
          </Col>
        </Row>

        {/* Bảng dữ liệu */}
        <Card className="shadow-md rounded-lg" bordered={false}>
          <ProTable
            dataSource={customers}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => (
                <span className="text-gray-600">
                  <TeamOutlined /> Tổng số <strong>{total}</strong> khách hàng
                </span>
              ),
            }}
            search={false}
            options={{
              reload: () => {
                window.location.reload();
              },
              density: true,
              setting: true,
            }}
            cardProps={false}
            tableLayout="fixed"
            headerTitle={
              <Space className="text-lg font-semibold text-gray-800">
                <TeamOutlined />
                Danh Sách Khách Hàng Xe Máy Điện
              </Space>
            }
          />
        </Card>
      </PageContainer>
    </DealerStaffLayout>
  );
}

export default GetAllEVCustomer;
