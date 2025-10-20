import React, { useEffect, useState, useCallback } from "react";
import {
  PageContainer,
  ProTable,
  ProCard,
  StatisticCard,
} from "@ant-design/pro-components";
import {
  App,
  Button,
  Tag,
  Space,
  Modal,
  Tooltip,
  Input,
  Row,
  Col,
  Empty,
  Badge,
} from "antd";
import {
  UserAddOutlined,
  LockOutlined,
  UnlockOutlined,
  ReloadOutlined,
  SearchOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import DealerManagerLayout from "../../../Components/DealerManager/DealerManagerLayout";
import {
  getAllDealerStaff,
  toggleDealerStaffStatus,
} from "../../../App/DealerManager/DealerStaffManagement/GetAllDealerStaff";
import DealerStaffCreateModal from "./Components/DealerStaffCreateModal";

const DealerStaffList = () => {
  const { message } = App.useApp();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createVisible, setCreateVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Fetch data
  const fetchStaff = useCallback(
    async (page = 1, pageSize = 10, query = "") => {
      try {
        setLoading(true);
        const res = await getAllDealerStaff({
          pageNumber: page,
          pageSize,
          filterOn: query ? "fullName" : undefined,
          filterQuery: query || undefined,
          sortBy: "createdat",
          isAcsending: true,
        });
        if (res.isSuccess) {
          let { data, pagination } = res.result;

          if (query) {
            data = data.filter(
              (item) =>
                item.fullName.toLowerCase().includes(query.toLowerCase())
            );
          }

          setStaffList(data);
          setPagination({
            current: pagination.pageNumber,
            pageSize: pagination.pageSize,
            total: pagination.totalItems,
          });
        } else {
          message.error("Không thể tải danh sách nhân viên");
        }
      } catch {
        message.error("Lỗi khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    },
    [message]
  );

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleToggleStatus = async (record) => {
    Modal.confirm({
      title: `${record.isActive ? "Khóa" : "Mở khóa"} tài khoản`,
      content: `Bạn có chắc muốn ${record.isActive ? "khóa" : "mở khóa"
        } tài khoản của nhân viên "${record.fullName}" không?`,
      okText: "Xác nhận",
      cancelText: "Hủy",
      centered: true,
      onOk: async () => {
        try {
          await toggleDealerStaffStatus(record.email);
          message.success("Cập nhật trạng thái thành công");
          fetchStaff(pagination.current, pagination.pageSize, searchText);
        } catch {
          message.error("Không thể cập nhật trạng thái");
        }
      },
    });
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center",
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      align: "center",
      width: 140,
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      align: "center",
      width: 140,
      render: (val) =>
        val ? (
          <Tag color="green">Đang hoạt động</Tag>
        ) : (
          <Tag color="red">Đã khóa</Tag>
        ),
    },
    {
      title: "Hành động",
      key: "actions",
      align: "center",
      width: 160,
      render: (_, record) => (
        <Space>
          <Tooltip title={record.isActive ? "Khóa tài khoản" : "Mở khóa"}>
            <Button
              type="default"
              shape="circle"
              icon={
                record.isActive ? (
                  <LockOutlined style={{ color: "#fa541c" }} />
                ) : (
                  <UnlockOutlined style={{ color: "#52c41a" }} />
                )
              }
              onClick={() => handleToggleStatus(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <DealerManagerLayout>
      <PageContainer
        title="Danh sách nhân viên đại lý"
        subTitle="Quản lý và theo dõi thông tin nhân viên của đại lý bạn"
        extra={[
          <Button
            key="create"
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => setCreateVisible(true)}
          >
            Tạo nhân viên
          </Button>,
          <Button
            key="refresh"
            icon={<ReloadOutlined />}
            onClick={() =>
              fetchStaff(pagination.current, pagination.pageSize, searchText)
            }
          >
            Làm mới
          </Button>,
        ]}
      >
        <ProCard split="horizontal" bordered>
          <Space>
            <Input
              placeholder="🔍 Tìm theo họ tên"
              prefix={<SearchOutlined />}
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={() =>
                fetchStaff(1, pagination.pageSize, searchText)
              } // reset về trang 1 khi tìm
              style={{ width: 300 }}
            />
            <Button
              type="default"
              icon={<SearchOutlined />}
              onClick={() => fetchStaff(1, pagination.pageSize, searchText)}
            >
              Tìm kiếm
            </Button>
          </Space>

          {/* Bảng dữ liệu */}
          <ProCard>
            <ProTable
              columns={columns}
              dataSource={staffList}
              loading={loading}
              rowKey="id"
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showTotal: (total) => `Tổng ${total} nhân viên`,
                onChange: (page, pageSize) =>
                  fetchStaff(page, pageSize, searchText),
              }}
              search={false}
              bordered
              options={false}
              sticky
              scroll={{ y: 500 }}
              locale={{
                emptyText: (
                  <Empty
                    description="Chưa có nhân viên nào"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ),
              }}
            />
          </ProCard>
        </ProCard>

        {/* Modal tạo nhân viên */}
        <DealerStaffCreateModal
          visible={createVisible}
          onCancel={() => setCreateVisible(false)}
          onSuccess={() => {
            setCreateVisible(false);
            fetchStaff(pagination.current, pagination.pageSize, searchText);
          }}
        />
      </PageContainer>
    </DealerManagerLayout>
  );
};

export default DealerStaffList;
