import React, { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Image,
  Typography,
  Row,
  Col,
  Statistic,
  Input,
  Select,
  Modal,
  Form,
  Upload,
  InputNumber,
  message,
  Popconfirm,
  Tooltip,
  Badge,
  Divider
} from 'antd';
import {
  PageContainer,
  ProCard,
  StatisticCard
} from '@ant-design/pro-components';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  CarOutlined,
  ThunderboltOutlined,
  DashboardOutlined,
  SettingOutlined,
  ExportOutlined,
  FilterOutlined
} from '@ant-design/icons';
import NavigationBar from '../../../Components/Admin/Components/NavigationBar';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

function VehicleManagement() {
  const [collapsed, setCollapsed] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [form] = Form.useForm();

  // Dữ liệu xe điện
  const [vehicleData, setVehicleData] = useState(() => [
    {
      key: '1',
      id: 'VF001',
      name: 'VinFast VF8',
      category: 'SUV Điện',
      price: 1200000000,
      batteryCapacity: 82,
      range: 420,
      seats: 7,
      color: ['Đỏ', 'Trắng', 'Đen', 'Xanh'],
      stock: 150,
      status: 'Đang bán',
      image: 'https://via.placeholder.com/300x200/1890ff/ffffff?text=VF8',
      description: 'SUV điện cao cấp với công nghệ tiên tiến',
      manufacturer: 'VinFast',
      year: 2024
    },
    {
      key: '2',
      id: 'VF002',
      name: 'VinFast VF9',
      category: 'SUV Cao cấp',
      price: 1500000000,
      batteryCapacity: 92,
      range: 438,
      seats: 7,
      color: ['Đen', 'Trắng', 'Bạc'],
      stock: 85,
      status: 'Đang bán',
      image: 'https://via.placeholder.com/300x200/52c41a/ffffff?text=VF9',
      description: 'SUV điện hạng sang với không gian rộng rãi',
      manufacturer: 'VinFast',
      year: 2024
    },
    {
      key: '3',
      id: 'VF003',
      name: 'VinFast VF6',
      category: 'Hatchback Điện',
      price: 650000000,
      batteryCapacity: 59.6,
      range: 344,
      seats: 5,
      color: ['Xanh', 'Đỏ', 'Trắng', 'Vàng'],
      stock: 220,
      status: 'Đang bán',
      image: 'https://via.placeholder.com/300x200/faad14/ffffff?text=VF6',
      description: 'Xe điện thông minh phù hợp đô thị',
      manufacturer: 'VinFast',
      year: 2024
    }
  ]);

  // Thống kê cơ bản
  const totalVehicles = vehicleData.length;
  const totalStock = vehicleData.reduce((sum, item) => sum + item.stock, 0);

  // Lọc dữ liệu
  const filteredData = useMemo(() => {
    return vehicleData.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         item.id.toLowerCase().includes(searchText.toLowerCase());
      const matchCategory = filterCategory === 'all' || item.category === filterCategory;
      const matchStatus = filterStatus === 'all' || item.status === filterStatus;
      
      return matchSearch && matchCategory && matchStatus;
    });
  }, [vehicleData, searchText, filterCategory, filterStatus]);

  // Danh mục xe
  const categories = ['SUV Điện', 'SUV Cao cấp', 'Hatchback Điện', 'Sedan Điện', 'City Car'];
  const statuses = ['Đang bán', 'Sắp ra mắt', 'Ngừng bán'];

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      color: record.color.join(', ')
    });
    setIsModalVisible(true);
  };

  const handleView = (record) => {
    setSelectedRecord(record);
    setIsViewModalVisible(true);
  };

  const handleDelete = (key) => {
    setVehicleData(vehicleData.filter(item => item.key !== key));
    message.success('Đã xóa xe thành công!');
  };

  const handleSubmit = (values) => {
    const colorArray = values.color.split(',').map(c => c.trim()).filter(c => c);
    const newRecord = {
      ...values,
      color: colorArray,
      key: editingRecord ? editingRecord.key : Date.now().toString(),
      id: editingRecord ? editingRecord.id : `VF${String(vehicleData.length + 1).padStart(3, '0')}`,
      image: editingRecord ? editingRecord.image : 'https://via.placeholder.com/300x200/1890ff/ffffff?text=NEW'
    };

    if (editingRecord) {
      setVehicleData(vehicleData.map(item => 
        item.key === editingRecord.key ? newRecord : item
      ));
      message.success('Đã cập nhật thông tin xe thành công!');
    } else {
      setVehicleData([...vehicleData, newRecord]);
      message.success('Đã thêm xe mới thành công!');
    }

    setIsModalVisible(false);
    form.resetFields();
  };

  // Cột của bảng
  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      key: 'image',
      width: 80,
      render: (image) => (
        <Image
          width={60}
          height={40}
          src={image}
          className="rounded object-cover"
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
        />
      ),
    },
    {
      title: 'Thông tin xe',
      key: 'info',
      render: (_, record) => (
        <div>
          <div className="font-medium text-base">{record.name}</div>
          <div className="text-sm text-gray-500">ID: {record.id}</div>
          <Tag color="blue" className="mt-1">{record.category}</Tag>
        </div>
      ),
    },
    {
      title: 'Giá bán (VND)',
      dataIndex: 'price',
      key: 'price',
      render: (price) => (
        <Text strong className="text-green-600">
          {price.toLocaleString()} VND
        </Text>
      ),
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Thông số kỹ thuật',
      key: 'specs',
      render: (_, record) => (
        <div className="text-sm">
          <div>Pin: {record.batteryCapacity} kWh</div>
          <div>Quãng đường: {record.range} km</div>
          <div>Số chỗ: {record.seats} người</div>
        </div>
      ),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock) => (
        <div className="text-center">
          <Text 
            strong
            style={{ 
              color: stock < 100 ? '#ff4d4f' : '#52c41a'
            }}
          >
            {stock} xe
          </Text>
        </div>
      ),
      sorter: (a, b) => a.stock - b.stock,
    },
    {
      title: 'Màu sắc',
      dataIndex: 'color',
      key: 'color',
      render: (colors) => (
        <div className="flex flex-wrap gap-1">
          {colors.slice(0, 3).map(color => (
            <Tag key={color} size="small">{color}</Tag>
          ))}
          {colors.length > 3 && (
            <Tag size="small">+{colors.length - 3}</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          'Đang bán': 'success',
          'Sắp ra mắt': 'processing',
          'Ngừng bán': 'error'
        };
        return <Tag color={colors[status]}>{status}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleView(record)}
              className="text-blue-500"
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
              className="text-green-500"
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa xe này?"
            onConfirm={() => handleDelete(record.key)}
            okText="Có"
            cancelText="Không"
          >
            <Tooltip title="Xóa">
              <Button 
                type="text" 
                icon={<DeleteOutlined />} 
                className="text-red-500"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <NavigationBar 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
      />
      
      {/* Main Content */}
      <div 
        className="flex-1 transition-all duration-200"
        style={{ 
          marginLeft: collapsed ? 64 : 280,
          minHeight: '100vh'
        }}
      >
        <PageContainer
          header={{
            title: 'Quản lý xe điện',
            subTitle: 'Quản lý danh sách và thông tin các mẫu xe điện',
            breadcrumb: {
              items: [
                { title: 'Trang chủ' },
                { title: 'Admin' },
                { title: 'Quản lý xe điện' }
              ]
            }
          }}
          className="p-6"
        >
          {/* Thông tin tổng quan */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} lg={8}>
              <Card className="text-center">
                <Statistic
                  title="Số mẫu xe"
                  value={totalVehicles}
                  prefix={<CarOutlined className="text-blue-500" />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card className="text-center">
                <Statistic
                  title="Tổng tồn kho"
                  value={totalStock}
                  suffix=" xe"
                  prefix={<DashboardOutlined className="text-green-500" />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card className="text-center">
                <Statistic
                  title="Xe có sẵn"
                  value={filteredData.length}
                  suffix=" mẫu"
                  prefix={<SettingOutlined className="text-orange-500" />}
                />
              </Card>
            </Col>
          </Row>

          {/* Filters and Search */}
          <ProCard className="mb-6 shadow-sm">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={8} md={6}>
                <Search
                  placeholder="Tìm kiếm xe..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  prefix={<SearchOutlined />}
                />
              </Col>
              <Col xs={24} sm={8} md={4}>
                <Select
                  placeholder="Danh mục"
                  value={filterCategory}
                  onChange={setFilterCategory}
                  className="w-full"
                >
                  <Option value="all">Tất cả danh mục</Option>
                  {categories.map(cat => (
                    <Option key={cat} value={cat}>{cat}</Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={8} md={4}>
                <Select
                  placeholder="Trạng thái"
                  value={filterStatus}
                  onChange={setFilterStatus}
                  className="w-full"
                >
                  <Option value="all">Tất cả trạng thái</Option>
                  {statuses.map(status => (
                    <Option key={status} value={status}>{status}</Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={24} md={10} className="text-right">
                <Space>
                  <Button 
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                    size="large"
                  >
                    Thêm xe mới
                  </Button>
                </Space>
              </Col>
            </Row>
          </ProCard>

          {/* Vehicle Table */}
          <ProCard className="shadow-sm">
            <Table
              columns={columns}
              dataSource={filteredData}
              pagination={{
                total: filteredData.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} của ${total} xe`,
              }}
              scroll={{ x: 1200 }}
              className="custom-table"
            />
          </ProCard>

          {/* Add/Edit Modal */}
          <Modal
            title={editingRecord ? 'Chỉnh sửa thông tin xe' : 'Thêm xe điện mới'}
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={null}
            width={800}
            className="vehicle-modal"
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              className="mt-4"
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="Tên xe"
                    rules={[{ required: true, message: 'Vui lòng nhập tên xe!' }]}
                  >
                    <Input placeholder="VD: VinFast VF8" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="category"
                    label="Danh mục"
                    rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                  >
                    <Select placeholder="Chọn danh mục">
                      {categories.map(cat => (
                        <Option key={cat} value={cat}>{cat}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="price"
                    label="Giá bán (VND)"
                    rules={[{ required: true, message: 'Vui lòng nhập giá bán!' }]}
                  >
                    <InputNumber
                      className="w-full"
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      placeholder="VD: 1200000000"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="manufacturer"
                    label="Nhà sản xuất"
                    rules={[{ required: true, message: 'Vui lòng nhập nhà sản xuất!' }]}
                  >
                    <Input placeholder="VD: VinFast" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="batteryCapacity"
                    label="Dung lượng pin (kWh)"
                    rules={[{ required: true, message: 'Vui lòng nhập dung lượng pin!' }]}
                  >
                    <InputNumber className="w-full" placeholder="VD: 82" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="range"
                    label="Quãng đường (km)"
                    rules={[{ required: true, message: 'Vui lòng nhập quãng đường!' }]}
                  >
                    <InputNumber className="w-full" placeholder="VD: 420" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="seats"
                    label="Số chỗ ngồi"
                    rules={[{ required: true, message: 'Vui lòng nhập số chỗ ngồi!' }]}
                  >
                    <InputNumber className="w-full" placeholder="VD: 7" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="year"
                    label="Năm sản xuất"
                    rules={[{ required: true, message: 'Vui lòng nhập năm sản xuất!' }]}
                  >
                    <InputNumber className="w-full" placeholder="VD: 2024" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="stock"
                    label="Số lượng tồn kho"
                    rules={[{ required: true, message: 'Vui lòng nhập số lượng tồn kho!' }]}
                  >
                    <InputNumber className="w-full" placeholder="VD: 150" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
              >
                <Select placeholder="Chọn trạng thái">
                  {statuses.map(status => (
                    <Option key={status} value={status}>{status}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="color"
                label="Màu sắc có sẵn"
                rules={[{ required: true, message: 'Vui lòng nhập màu sắc!' }]}
                extra="Nhập các màu cách nhau bởi dấu phẩy. VD: Đỏ, Trắng, Đen"
              >
                <Input placeholder="VD: Đỏ, Trắng, Đen, Xanh" />
              </Form.Item>

              <Form.Item
                name="description"
                label="Mô tả"
                rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
              >
                <Input.TextArea rows={3} placeholder="Mô tả chi tiết về xe..." />
              </Form.Item>

              <Divider />

              <Form.Item className="mb-0 text-right">
                <Space>
                  <Button onClick={() => setIsModalVisible(false)}>
                    Hủy
                  </Button>
                  <Button type="primary" htmlType="submit">
                    {editingRecord ? 'Cập nhật' : 'Thêm xe'}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>

          {/* View Details Modal */}
          <Modal
            title="Chi tiết xe điện"
            open={isViewModalVisible}
            onCancel={() => setIsViewModalVisible(false)}
            footer={[
              <Button key="close" onClick={() => setIsViewModalVisible(false)}>
                Đóng
              </Button>
            ]}
            width={900}
          >
            {selectedRecord && (
              <div className="p-4">
                <Row gutter={[24, 24]}>
                  <Col xs={24} lg={10}>
                    <Image
                      width="100%"
                      height={250}
                      src={selectedRecord.image}
                      className="rounded-lg object-cover"
                    />
                  </Col>
                  <Col xs={24} lg={14}>
                    <Title level={3}>{selectedRecord.name}</Title>
                    <Space direction="vertical" size="middle" className="w-full">
                      <div>
                        <Text strong>ID: </Text>
                        <Text>{selectedRecord.id}</Text>
                      </div>
                      <div>
                        <Text strong>Danh mục: </Text>
                        <Tag color="blue">{selectedRecord.category}</Tag>
                      </div>
                      <div>
                        <Text strong>Giá bán: </Text>
                        <Text className="text-xl font-bold text-green-600">
                          {selectedRecord.price.toLocaleString()} VND
                        </Text>
                      </div>
                      <div>
                        <Text strong>Nhà sản xuất: </Text>
                        <Text>{selectedRecord.manufacturer}</Text>
                      </div>
                      <div>
                        <Text strong>Năm sản xuất: </Text>
                        <Text>{selectedRecord.year}</Text>
                      </div>
                      <div>
                        <Text strong>Trạng thái: </Text>
                        <Tag color={selectedRecord.status === 'Đang bán' ? 'success' : 'processing'}>
                          {selectedRecord.status}
                        </Tag>
                      </div>
                    </Space>
                  </Col>
                </Row>

                <Divider />

                <Title level={4}>Thông số kỹ thuật</Title>
                <Row gutter={[16, 16]}>
                  <Col xs={12} sm={8}>
                    <Statistic
                      title="Dung lượng pin"
                      value={selectedRecord.batteryCapacity}
                      suffix="kWh"
                      prefix={<BatteryChargingOutlined />}
                    />
                  </Col>
                  <Col xs={12} sm={8}>
                    <Statistic
                      title="Quãng đường"
                      value={selectedRecord.range}
                      suffix="km"
                    />
                  </Col>
                  <Col xs={12} sm={8}>
                    <Statistic
                      title="Số chỗ ngồi"
                      value={selectedRecord.seats}
                      suffix="chỗ"
                    />
                  </Col>
                </Row>

                <Divider />

                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Title level={5}>Màu sắc có sẵn</Title>
                    <div className="flex flex-wrap gap-2">
                      {selectedRecord.color.map(color => (
                        <Tag key={color} color="blue">{color}</Tag>
                      ))}
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Title level={5}>Tình trạng kho</Title>
                    <div>
                      <Text strong>Tồn kho: </Text>
                      <Text style={{ color: selectedRecord.stock < 100 ? '#ff4d4f' : '#52c41a' }}>
                        {selectedRecord.stock} xe
                      </Text>
                    </div>
                  </Col>
                </Row>

                <Divider />

                <Title level={5}>Mô tả</Title>
                <Text>{selectedRecord.description}</Text>
              </div>
            )}
          </Modal>
        </PageContainer>
      </div>
    </div>
  );
}

export default VehicleManagement;
