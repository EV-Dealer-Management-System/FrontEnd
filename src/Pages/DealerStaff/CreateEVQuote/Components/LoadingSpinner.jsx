import React from 'react';
import { Spin, Card } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';

function LoadingSpinner({
    tip = "Đang tải dữ liệu...",
    size = "large",
    className = "",
    description = "Vui lòng đợi trong giây lát"
}) {
    // Custom loading icon
    const antIcon = <LoadingOutlined style={{ fontSize: size === 'large' ? 40 : 24 }} spin />;

    return (
        <ProCard
            className={`shadow-md border-0 rounded-xl ${className}`}
            headerBordered={false}
            bordered={false}
        >
            <div className="flex flex-col justify-center items-center py-12">
                <Spin
                    indicator={antIcon}
                    tip={
                        <div className="mt-4 text-blue-600 font-medium text-base">{tip}</div>
                    }
                >
                    <div className="w-20 h-20" />
                </Spin>
                {description && (
                    <p className="text-gray-500 text-sm mt-4">{description}</p>
                )}
            </div>
        </ProCard>
    );
}

export default LoadingSpinner;