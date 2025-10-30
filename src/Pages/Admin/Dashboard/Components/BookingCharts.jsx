import React, { useMemo } from 'react';
import { Row, Col } from 'antd';
import { ProCard, StatisticCard } from '@ant-design/pro-components';

const { Statistic } = StatisticCard;

function BookingCharts({ bookingData, loading }) {

    // Tính toán dữ liệu cho biểu đồ tròn (phân bố trạng thái)
    const statusDistribution = useMemo(() => {
        if (!bookingData || !Array.isArray(bookingData)) return [];

        // Mapping theo BookingStatus enum: Draft=0, Pending=1, Approved=2, Rejected=3, Cancelled=4, Completed=5
        const statusMap = {
            0: { label: 'Bản Nháp', color: '#8c8c8c', count: 0 },
            1: { label: 'Chờ Duyệt', color: '#fa8c16', count: 0 },
            2: { label: 'Đã Duyệt', color: '#52c41a', count: 0 },
            3: { label: 'Từ Chối', color: '#ff4d4f', count: 0 },
            4: { label: 'Đã Hủy', color: '#d9d9d9', count: 0 },
            5: { label: 'Hoàn Thành', color: '#1890ff', count: 0 }
        };

        bookingData.forEach(booking => {
            if (statusMap[booking.status] !== undefined) {
                statusMap[booking.status].count++;
            }
        });

        return Object.values(statusMap).filter(item => item.count > 0);
    }, [bookingData]);

    // Tính toán dữ liệu cho biểu đồ cột (booking theo ngày gần đây)
    const bookingTrend = useMemo(() => {
        if (!bookingData || !Array.isArray(bookingData)) return [];

        // Lấy 7 ngày gần nhất
        const days = {};
        const today = new Date();

        // Khởi tạo 7 ngày
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = `${date.getDate()}-${date.getMonth() + 1}`;
            days[dateStr] = 0;
        }

        // Đếm booking cho mỗi ngày
        bookingData.forEach(booking => {
            const bookingDate = new Date(booking.bookingDate);
            const dateStr = `${bookingDate.getDate()}-${bookingDate.getMonth() + 1}`;
            if (days[dateStr] !== undefined) {
                days[dateStr]++;
            }
        });

        return Object.entries(days).map(([date, count]) => ({
            date,
            count
        }));
    }, [bookingData]);

    // Tính tổng và tỷ lệ phần trăm cho donut chart
    const total = statusDistribution.reduce((sum, item) => sum + item.count, 0);
    const maxCount = Math.max(...bookingTrend.map(item => item.count), 1);

    // Tính toán góc cho SVG donut chart
    const calculateDonutSegments = () => {
        let currentAngle = -90; // Bắt đầu từ top
        const segments = [];

        statusDistribution.forEach((item) => {
            const percentage = (item.count / total) * 100;
            const angle = (percentage / 100) * 360;

            segments.push({
                ...item,
                percentage: percentage.toFixed(1),
                startAngle: currentAngle,
                angle: angle
            });

            currentAngle += angle;
        });

        return segments;
    }; const donutSegments = calculateDonutSegments();

    return (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {/* Biểu đồ tròn - Phân bố trạng thái */}
            <Col xs={24} lg={12}>
                <ProCard
                    title="Phân Bố Trạng Thái Booking"
                    bordered
                    headerBordered
                    extra={<span style={{ color: '#1890ff', fontSize: 14 }}>Tổng: {total}</span>}
                    loading={loading}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
                        {total > 0 ? (
                            <>
                                {/* SVG Donut Chart */}
                                <div style={{ position: 'relative', width: '220px', height: '220px' }}>
                                    <svg viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
                                        {donutSegments.map((segment, index) => {
                                            const radius = 70;
                                            const circumference = 2 * Math.PI * radius;
                                            const strokeDasharray = `${(segment.angle / 360) * circumference} ${circumference}`;
                                            const strokeDashoffset = -((segment.startAngle + 90) / 360) * circumference;

                                            return (
                                                <circle
                                                    key={index}
                                                    cx="100"
                                                    cy="100"
                                                    r={radius}
                                                    fill="transparent"
                                                    stroke={segment.color}
                                                    strokeWidth="40"
                                                    strokeDasharray={strokeDasharray}
                                                    strokeDashoffset={strokeDashoffset}
                                                    style={{
                                                        transition: 'all 0.3s ease',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                            );
                                        })}
                                    </svg>
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <div style={{ textAlign: 'center', marginTop: '-25px' }}>
                                            <div style={{ fontSize: 40, fontWeight: 'bold', color: '#262626' }}>{total}</div>

                                        </div>
                                    </div>
                                </div>

                                {/* Legend */}
                                <div style={{ marginLeft: 32 }}>
                                    {donutSegments.map((segment, index) => (
                                        <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                                            <div
                                                style={{
                                                    width: 12,
                                                    height: 12,
                                                    borderRadius: '50%',
                                                    backgroundColor: segment.color,
                                                    marginRight: 8
                                                }}
                                            />
                                            <span style={{ fontSize: 14, color: '#595959', marginRight: 8 }}>
                                                {segment.label}
                                            </span>
                                            <span style={{ fontSize: 14, fontWeight: 600, color: '#262626' }}>
                                                {segment.count} ({segment.percentage}%)
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', color: '#8c8c8c' }}>Chưa có dữ liệu</div>
                        )}
                    </div>
                </ProCard>
            </Col>

            {/* Biểu đồ cột - Xu hướng 7 ngày */}
            <Col xs={24} lg={12}>
                <StatisticCard
                    title="Xu Hướng 7 Ngày Gần Nhất"
                    extra={<span style={{ color: '#52c41a', fontSize: 14 }}>Booking mới</span>}
                    chart={
                        <div style={{ padding: '20px 10px 10px' }}>
                            <div style={{
                                height: 200,
                                display: 'flex',
                                alignItems: 'flex-end',
                                gap: '8px',
                                justifyContent: 'space-evenly'
                            }}>
                                {bookingTrend.map((item, index) => {
                                    const heightPercent = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                                    const barHeight = Math.max(heightPercent, 5); // Tối thiểu 5%

                                    return (
                                        <div
                                            key={index}
                                            style={{
                                                flex: 1,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'flex-end',
                                                height: '100%'
                                            }}
                                        >
                                            {/* Số liệu */}
                                            <div style={{
                                                fontSize: 18,
                                                fontWeight: 'bold',
                                                color: '#262626',
                                                marginBottom: 8
                                            }}>
                                                {item.count}
                                            </div>

                                            {/* Cột - chiều cao thay đổi theo số lượng */}
                                            <div
                                                style={{
                                                    width: '100%',
                                                    backgroundColor: '#1890ff',
                                                    borderRadius: '4px 4px 0 0',
                                                    height: `${barHeight}%`,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease',
                                                    minHeight: 10
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#40a9ff';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#1890ff';
                                                }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Ngày tháng */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-evenly',
                                gap: '8px',
                                marginTop: 10
                            }}>
                                {bookingTrend.map((item, index) => (
                                    <div key={index} style={{
                                        fontSize: 12,
                                        color: '#8c8c8c',
                                        textAlign: 'center',
                                        flex: 1
                                    }}>
                                        {item.date}
                                    </div>
                                ))}
                            </div>
                        </div>
                    }
                    loading={loading}
                />
            </Col>
        </Row>
    );
}

export default BookingCharts;
