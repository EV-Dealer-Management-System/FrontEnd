import React from 'react';
import { StatisticCard } from '@ant-design/pro-components';
import { Progress, theme } from 'antd';

// Component thống kê booking với Ant Design Pro
function BookingStatCard({ title, value, icon, iconColor, gradient, description }) {
  const { useToken } = theme;
  const { token } = useToken();

  // Tính toán phần trăm cho progress bar dựa trên value
  const calculateProgress = () => {
    // Giả sử target là 100 để demo
    const target = 100;
    const current = typeof value === 'number' ? value : parseInt(value) || 0;
    return Math.min(Math.round((current / target) * 100), 100);
  };

  return (
    <StatisticCard
      className={`hover:shadow-lg transition-all duration-300 ${gradient}`}
      statistic={{
        title: (
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg ${iconColor.replace('text', 'bg').replace('-500', '-100')}`}>
              <span className={`text-xl ${iconColor}`}>
                {icon}
              </span>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                {title}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {description}
              </div>
            </div>
          </div>
        ),
        value: value,
        valueStyle: {
          fontSize: '2rem',
          fontWeight: '600',
          color: token.colorTextHeading,
          marginTop: '1rem'
        }
      }}
      chart={
        <div className="pt-4">
          <Progress
            percent={calculateProgress()}
            strokeColor={iconColor.replace('text', 'bg').replace('-500', '-400')}
            trailColor={iconColor.replace('text', 'bg').replace('-500', '-50')}
            size="small"
            showInfo={false}
          />
        </div>
      }
      footer={
        <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
          <span>Mục tiêu tháng</span>
          <span className={`flex items-center ${value >= 50 ? 'text-green-500' : 'text-orange-500'}`}>
            <span className="mr-1">{value >= 50 ? '↑' : '↓'}</span>
            {calculateProgress()}%
          </span>
        </div>
      }
    />
  );
}

export default BookingStatCard;
