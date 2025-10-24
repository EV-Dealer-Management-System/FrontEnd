import React, {useState, useEffect} from "react";
import { Table, Tag, Select, Input, DatePicker, Space, Spin, notification } from "antd";
import useFetchContracts from "../../../App/EVMStaff/Contract/GetAllContract.js";
import dayjs from "dayjs";
import viVN from 'antd/lib/locale/vi_VN';
import { ConfigProvider } from "antd";
const { RangePicker } = DatePicker;

export default function ViewAllContract() {
  const { contracts, loading, updateFilter, reload } = useFetchContracts();
  const [filteredContracts, setFilteredContracts] = useState([]);

    // Cập nhật filteredContracts khi contracts thay đổi
    useEffect(() => {
      setFilteredContracts(contracts);
    }, [contracts]);

    // Xử lý thay đổi filter
    const handleStatusChange = (value) => {
      updateFilter('status', value);
    };

    const handleSearchChange = (e) => {
      updateFilter('search', e.target.value);
    };
    const handleDateRangeChange = (dates, dateStrings) => {
      if (!dates || dates.length === 0) {
        updateFilter('dateRange', null);
        return;
      }
      updateFilter('dateRange', dateStrings);
    };
    return (
      <ConfigProvider locale={viVN}>
      <div style={{ padding: 24, background: '#fff' }}>
        <Space style={{ marginBottom: 16 }}>
          <Select
            placeholder="Lọc theo trạng thái"
            style={{ width: 200 }}
            onChange={handleStatusChange}
            allowClear
          >
            <Select.Option value={1}>Đang chờ</Select.Option>
            <Select.Option value={2}>Đã hoàn thành</Select.Option>
            <Select.Option value={3}>Đã hủy</Select.Option>
          </Select>
          <Input
            placeholder="Tìm kiếm theo tên hoặc mã hợp đồng"
            onChange={handleSearchChange}
            style={{ width: 300 }}
          />
          <RangePicker
            onChange={handleDateRangeChange}
            style={{ width: 400 }}
          />
        </Space>
        <Table
          dataSource={filteredContracts}
          loading={loading}
          rowKey="id"
        >
          <Table.Column title="Mã hợp đồng" dataIndex="id" />
          <Table.Column title="Tên hợp đồng" dataIndex="name" />
          <Table.Column title="Trạng thái" dataIndex="status" />
          <Table.Column title="Ngày tạo" dataIndex="createdAt" />
        </Table>
      </div>
    </ConfigProvider>
  );
}