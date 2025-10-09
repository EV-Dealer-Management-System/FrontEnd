import React from 'react';
import { Input, Space, Button } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';

// Component thanh tìm kiếm
function BookingSearchBar({ searchText, onSearch, onReload, loading }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
      <Space direction="vertical" size="middle" className="w-full">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex-1 min-w-[300px] max-w-2xl">
            <Input
              placeholder="🔍 Tìm kiếm theo tên, SĐT, email, mã booking, xe..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={(e) => onSearch(e.target.value)}
              size="large"
              allowClear
              className="rounded-lg"
            />
          </div>
          <Button
            icon={<ReloadOutlined />}
            onClick={onReload}
            loading={loading}
            size="large"
            className="rounded-lg"
          >
            Làm mới
          </Button>
        </div>
      </Space>
    </div>
  );
}

export default BookingSearchBar;
