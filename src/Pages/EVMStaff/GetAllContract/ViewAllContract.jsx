import React, {useState, useEffect, use} from "react";
import { Table, Tag, Select, Input, DatePicker, Space, Spin, notification, Button } from "antd";
import useFetchContracts from "../../../App/EVMStaff/Contract/GetAllContract.js";
import dayjs from "dayjs";
import viVN from 'antd/lib/locale/vi_VN';
import { ConfigProvider } from "antd";
import EVMStaffLayout from "../../../Components/EVMStaff/EVMStaffLayout.jsx";
import PDFModalForConfirm from "./Component/PDFModalForConfirm.jsx";
import useConfirmContract  from "../../../App/EVMStaff/Contract/ConfirmContract.js";
import contracDetail from "../../../App/EVMStaff/Contract/GetContractDetail.js";
const { RangePicker } = DatePicker;

function ViewAllContract() {
  const { contracts, loading, updateFilter } = useFetchContracts();
  const [filteredContracts, setFilteredContracts] = useState([]);
  // Modal state
  const [isModalOpen, setIsModalOpen]= useState(false);
  const [selected, setSelected]= useState (null);
  const [pdfUrl, setPdfUrl]= useState(null);


    //hook confirm
    const {
      handleConfirmContract,
      loading: confirming,
    } = useConfirmContract();

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

    const handleViewContract = async (contractId) => {
      try {
        setSelected(contractId);
        const detail = await contracDetail.getContractById(contractId);
        const url = detail?.data?.downloadUrl;
        if(!url) {
          notification.error({
            message: 'Lỗi',
            description: 'Hợp đồng không có file PDF.',
          });
          return;
        }
        setPdfUrl(url);
        setIsModalOpen(true);
      } catch (error) {
        notification.error({
          message: 'Lỗi',
          description: 'Không thể tải hợp đồng.',
          duration: 4,
          placement: 'topRight',
        });
      }
    };

    return (
      <EVMStaffLayout>
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
          <Table.Column title="Thao tác" key="action" render={(text, record) => (
            <Space size="middle">
              <Button onClick={() => {
                handleConfirmContract(record);
              }}>Xem chi tiết</Button>
            </Space>
          )} />
        </Table>
        <PDFModalForConfirm
          visible={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          pdfUrl={pdfUrl}
          contractId={selected?.id}
          confirming={confirming}
          onConfirm={handleConfirmContract}
        />
      </div>
    </ConfigProvider>
    </EVMStaffLayout>
  );
}

export default ViewAllContract;