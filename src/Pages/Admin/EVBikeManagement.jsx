import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message } from 'antd';

const initialData = [
  {
    key: '1',
    name: 'VinFast Feliz',
    model: 'VF-2024',
    price: 32000000,
    stock: 10,
  },
  {
    key: '2',
    name: 'Yadea G5',
    model: 'YD-G5',
    price: 28000000,
    stock: 5,
  },
];

const EVBikeManagement = () => {
  const [data, setData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBike, setEditingBike] = useState(null);
  const [form] = Form.useForm();

  const showAddModal = () => {
    setEditingBike(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const showEditModal = (record) => {
    setEditingBike(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = (key) => {
    setData(data.filter((item) => item.key !== key));
    message.success('Đã xóa xe thành công!');
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        if (editingBike) {
          setData(
            data.map((item) =>
              item.key === editingBike.key ? { ...editingBike, ...values } : item
            )
          );
          message.success('Cập nhật xe thành công!');
        } else {
          setData([
            ...data,
            { ...values, key: Date.now().toString() },
          ]);
          message.success('Thêm xe mới thành công!');
        }
        setIsModalOpen(false);
        form.resetFields();
      })
      .catch(() => {});
  };

  const columns = [
    {
      title: 'Tên xe',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Model',
      dataIndex: 'model',
      key: 'model',
    },
    {
      title: 'Giá bán (VNĐ)',
      dataIndex: 'price',
      key: 'price',
      render: (price) => price.toLocaleString(),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => showEditModal(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn chắc chắn muốn xóa?"
            onConfirm={() => handleDelete(record.key)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Quản lý xe điện</h2>
        <Button type="primary" onClick={showAddModal}>
          Thêm xe mới
        </Button>
      </div>
      <Table columns={columns} dataSource={data} pagination={{ pageSize: 5 }} />
      <Modal
        title={editingBike ? 'Cập nhật xe điện' : 'Thêm xe điện mới'}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        okText={editingBike ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên xe"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên xe!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Model"
            name="model"
            rules={[{ required: true, message: 'Vui lòng nhập model!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Giá bán (VNĐ)"
            name="price"
            rules={[{ required: true, message: 'Vui lòng nhập giá bán!' }]}
          >
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item
            label="Tồn kho"
            name="stock"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng tồn kho!' }]}
          >
            <Input type="number" min={0} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EVBikeManagement;
