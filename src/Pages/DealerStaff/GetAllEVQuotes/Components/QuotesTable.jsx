import React, { useState } from "react";
import { Table, Tag, Button, Space, Input, Select, Tooltip } from "antd";
import { ProCard } from "@ant-design/pro-components";
import {
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  DollarOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

const { Search } = Input;
const { Option } = Select;

function QuotesTable({
  quotes,
  formatCurrency,
  formatDate,
  getQuoteStatus,
  onViewDetails,
}) {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
      width: 120,
      fixed: "left",
      render: (id) => (
        <Tooltip title={id}>
          <span className="text-blue-600 font-mono text-xs">
            {id.substring(0, 8)}...
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Thông tin xe",
      key: "vehicle",
      width: 250,
      render: (_, record) => {
        const firstDetail = record.quoteDetails[0];
        return (
          <div className="space-y-1">
            <div className="font-semibold text-gray-800">
              {firstDetail.version.modelName}
            </div>
            <div className="text-sm text-gray-500">
              {firstDetail.version.versionName}
            </div>
            <Tag color="blue">{firstDetail.color.colorName}</Tag>
            {record.quoteDetails.length > 1 && (
              <Tag color="purple">
                +{record.quoteDetails.length - 1} sản phẩm
              </Tag>
            )}
          </div>
        );
      },
    },
    {
      title: "Số lượng",
      key: "quantity",
      width: 100,
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
      width: 180,
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
      width: 150,
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
      width: 150,
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
      width: 120,
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
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      width: 150,
      ellipsis: true,
      render: (note) => (
        <Tooltip title={note}>
          <span className="text-gray-600">{note || "-"}</span>
        </Tooltip>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => onViewDetails(record)}
          className="bg-blue-500 hover:bg-blue-600"
        >
          Xem
        </Button>
      ),
    },
  ];

  return (
    <ProCard
      title={
        <div className="flex items-center gap-2">
          <FilterOutlined className="text-blue-600" />
          <span>Danh sách báo giá</span>
        </div>
      }
      bordered
      className="shadow-lg"
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
        scroll={{ x: 1500 }}
        className="custom-table"
        rowClassName={(record, index) =>
          index % 2 === 0 ? "bg-gray-50" : "bg-white"
        }
      />
    </ProCard>
  );
}

export default QuotesTable;
