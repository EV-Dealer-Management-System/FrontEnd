import React, { useState } from "react";
import { Table, Tag, Button, Space, Input, Select, Tooltip } from "antd";
import { ProCard } from "@ant-design/pro-components";
import {
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  DollarOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import ApprovalModal from "./ApprovalModal";
import { ConfigProvider } from "antd";
import viVN from "antd/lib/locale/vi_VN";

const { Search } = Input;
const { Option } = Select;

function QuotesTable({
  quotes,
  formatCurrency,
  formatDate,
  getQuoteStatus,
  onViewDetails,
  onUpdateStatus,
}) {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedQuoteForApproval, setSelectedQuoteForApproval] =
    useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  // Mở modal duyệt báo giá
  const handleOpenApprovalModal = (quote) => {
    setSelectedQuoteForApproval(quote);
    setShowApprovalModal(true);
  };

  // Đóng modal duyệt báo giá
  const handleCloseApprovalModal = () => {
    setShowApprovalModal(false);
    setSelectedQuoteForApproval(null);
  };

  // Xác nhận duyệt/từ chối báo giá
  const handleConfirmApproval = async (quoteId, status, note) => {
    console.log("✅ QuotesTable - handleConfirmApproval:", {
      quoteId,
      status,
      note,
    });
    await onUpdateStatus(quoteId, status, note);
  };

  // Filter quotes based on search and status
  const filteredQuotes = quotes.filter((quote) => {
    // Status filter
    if (statusFilter !== "all" && quote.status !== parseInt(statusFilter)) {
      return false;
    }

    // Search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      return (
        quote.id.toLowerCase().includes(searchLower) ||
        quote.note?.toLowerCase().includes(searchLower) ||
        quote.quoteDetails.some(
          (detail) =>
            detail.version.modelName.toLowerCase().includes(searchLower) ||
            detail.version.versionName.toLowerCase().includes(searchLower) ||
            detail.color.colorName.toLowerCase().includes(searchLower)
        )
      );
    }

    return true;
  });

  const columns = [
    {
      title: "Mã báo giá",
      dataIndex: "id",
      key: "id",
     
      render: (id) => (
        <Tooltip title={id}>
          <span className="text-blue-600 font-mono text-xs">
            {id.substring(0, 8)}...
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Số lượng",
      key: "quantity",
      
      align: "center",
      render: (_, record) => {
        const totalQty = record.quoteDetails.reduce(
          (sum, detail) => sum + detail.quantity,
          0
        );
        return (
          <span className="font-semibold text-lg text-blue-600">
            {totalQty}
          </span>
        );
      },
    },
    {
      title: "Khuyến mãi",
      key: "promotion",
      
      render: (_, record) => {
        const firstDetail = record.quoteDetails[0];
        if (firstDetail.promotion) {
          return (
            <Tag color="pink" icon={<DollarOutlined />}>
              {firstDetail.promotion.promotionName}
            </Tag>
          );
        }
        return <span className="text-gray-400">Không có</span>;
      },
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      
      align: "right",
      render: (amount) => (
        <span className="font-bold text-green-600 text-base">
          {formatCurrency(amount)}
        </span>
      ),
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
     
      render: (date) => (
        <div className="flex items-center gap-1 text-gray-600">
          <CalendarOutlined />
          <span className="text-sm">{formatDate(date)}</span>
        </div>
      ),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      
      align: "center",
      render: (status) => {
        const statusInfo = getQuoteStatus(status);
        return (
          <Tag color={statusInfo.color} className="font-medium">
            {statusInfo.text}
          </Tag>
        );
      },
      filters: [
        { text: "Chờ duyệt", value: 0 },
        { text: "Đã duyệt", value: 1 },
        { text: "Từ chối", value: 2 },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Thao tác",
      key: "action",
     
      align: "center",
      render: (_, record) => (
        <Space  direction="vertical" size="small" align="center">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => onViewDetails(record)}
            className="bg-blue-500 hover:bg-blue-600"
            size="small"
          >
            Xem
          </Button>
          {record.status === 0 && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleOpenApprovalModal(record)}
              className="bg-orange-500 hover:bg-orange-600"
              size="small"
            >
              Duyệt đơn
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <ConfigProvider locale={viVN}>
    <ProCard
      title={
        <div className="flex items-center gap-2">
          <FilterOutlined className="text-blue-600" />
          <span>Danh sách báo giá</span>
        </div>
      }
      bordered
      className="shadow-lg"
      style={{
    width: "95%",          // ✅ cho khung to hơn
    maxWidth: 1300,        // ✅ tránh kéo dài vô hạn
    margin: "0 auto",      // ✅ căn giữa
    background: "white",
    borderRadius: 12,
    padding: 12
  }}
      extra={
        <Space>
          <Search
            placeholder="Tìm kiếm báo giá..."
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            prefix={<SearchOutlined />}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
          >
            <Option value="all">Tất cả trạng thái</Option>
            <Option value="0">Chờ duyệt</Option>
            <Option value="1">Đã duyệt</Option>
            <Option value="2">Từ chối</Option>
          </Select>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={filteredQuotes}
        rowKey="id"
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: filteredQuotes.length,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Tổng ${total} báo giá`,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          },
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        
        className="custom-table"
        rowClassName={(record, index) =>
          index % 2 === 0 ? "bg-gray-50" : "bg-white"
        }
      />

      {/* Approval Modal */}
      <ApprovalModal
        visible={showApprovalModal}
        quote={selectedQuoteForApproval}
        onClose={handleCloseApprovalModal}
        onConfirm={handleConfirmApproval}
      />
    </ProCard>
    </ConfigProvider>
  );
}

export default QuotesTable;
