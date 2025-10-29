import React, {useState, useEffect} from "react";
import { Table, Tag, Select, Input, DatePicker, Space, Spin, notification, Button, App } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import useFetchContracts from "../../../App/EVMStaff/Contract/GetAllContract.js";
import dayjs from "dayjs";
import viVN from 'antd/lib/locale/vi_VN';
import { ConfigProvider } from "antd";
import EVMStaffLayout from "../../../Components/EVMStaff/EVMStaffLayout.jsx";
import PDFModalForConfirm from "./Component/PDFModalForConfirm.jsx";
import useConfirmContract  from "../../../App/EVMStaff/Contract/ConfirmContract.js";
import contracDetail from "../../../App/EVMStaff/Contract/GetContractDetail.js";
import getPdfPreview from "../../../App/EVMStaff/Contract/GetPreviewPDF.js";
import deleteDealerContract from "../../../App/EVMStaff/Contract/DeleteDraftContract.js";
const { RangePicker } = DatePicker;

function ViewAllContract() {
  const { contracts, loading, updateFilter, refetch } = useFetchContracts();
  const [filteredContracts, setFilteredContracts] = useState([]);
  // Modal state
  const [isModalOpen, setIsModalOpen]= useState(false);
  const [selected, setSelected]= useState (null);
  const [pdfUrl, setPdfUrl]= useState(null);

  
  const {notification, message } = App.useApp();

  //hook reload danh sach
  const reloadContracts = async () => {
    console.debug('Reloading contracts list...');
    if(refetch) {
      await refetch();
      message.success('Danh sách hợp đồng đã được làm mới');
    } else {
      updateFilter('refreshAt', Date.now());
      message.success('Danh sách hợp đồng đã được làm mới');
    }
  };  

    //hook confirm
    const {
      handleConfirmContract,
      loading: confirming,
    } = useConfirmContract(selected);

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
        setIsModalOpen(true);
        setPdfUrl(null); // Reset pdfUrl trước khi tải mới
        const detail = await contracDetail.getContractById(contractId);
        const urlBlob = await getPdfPreview(detail?.data?.downloadUrl);
        if(!urlBlob) {
          notification.error({
            message: 'Lỗi',
            description: 'Hợp đồng không có file PDF.',
          });
          setIsModalOpen(false);
          return;
        }
        setPdfUrl(urlBlob);
        setIsModalOpen(true);
      } catch (error) {
        notification.error({
          message: 'Lỗi',
          description: 'Không thể tải hợp đồng.',
          duration: 4,
          placement: 'topRight',
        });
        setIsModalOpen(false);
      }
    };

    const handleDeleteContract = async (contractId) => {
      try {
        const confirm = window.confirm('Bạn có chắc chắn muốn xóa hợp đồng này không?');
        if (!confirm) return;
        const result = await deleteDealerContract(contractId);
        if (result.success) {
          notification.success({
            message: 'Thành công',
            description: 'Hợp đồng đã được xóa thành công.',
          });
        } else {
          notification.error({
            message: 'Thất bại',
            description: result.error || 'Không thể xóa hợp đồng.',
          });
        }
      } catch (error) {
        notification.error({
          message: 'Lỗi',
          description: 'Đã xảy ra lỗi khi xóa hợp đồng.',
        });
        console.error('Error deleting contract:', error);
      }
    };

    return (
      <EVMStaffLayout>
      <ConfigProvider locale={viVN}>
      <div style={{ padding: 24, background: '#fff' }}>
        <Space style={{ marginBottom: 16 }}>
          <Button 
          type="primary"
          onClick={reloadContracts}
          icon={<ReloadOutlined />}
          >
            Làm mới Danh sách
          </Button>
          {/* <Select
            placeholder="Lọc theo trạng thái"
            style={{ width: 200 }}
            onChange={handleStatusChange}
            allowClear
          >
            <Select.Option value={1}>Đang chờ</Select.Option>
            <Select.Option value={2}>Đã hoàn thành</Select.Option>
            <Select.Option value={3}>Đã hủy</Select.Option>
          </Select> */}
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
          <Table.Column title="Tên hợp đồng" dataIndex="name" />
          
          <Table.Column title="Ngày tạo" 
          dataIndex="createdAt" 
          sorter={(a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix()}
          defaultSortOrder="descend"
          render={(value) => {
            if (!value) return "—";
            return dayjs(value).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm");
          }} />
          <Table.Column title="Thao tác" key="action" render={(text, record) => (
            <Space size="middle">
              <Button onClick={() => {
                handleViewContract(record.id);
              }}>Xem chi tiết
              </Button>
              <Button 
              danger 
              onClick={() => {
                handleDeleteContract(record.id);
              }}>Xóa hợp đồng
              </Button>
            </Space>
          )} />
        </Table>
        <App>
        <PDFModalForConfirm
          visible={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          pdfUrl={pdfUrl}
          contractId={selected}
          confirmLoading={confirming}
          onConfirm={handleConfirmContract}
          contractNo={selected}
          title={`Xác nhận hợp đồng ${selected}`}
          onSuccess={() => {
            console.debug("[ViewAll] Hợp Đồng xác nhận xong -> Reload danh sách");
            setIsModalOpen(false);
            reloadContracts();
          }}
        />
        </App>
      </div>
    </ConfigProvider>
    </EVMStaffLayout>
  );
}

export default ViewAllContract;