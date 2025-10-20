import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, message, Alert } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import AdminLayout from '../../../Components/Admin/AdminLayout';
import { GetAllDealerContract } from '../../../App/EVMAdmin/DealerContract/GetAllDealerContract';
import ContractStatistics from './Components/ContractStatistics';
import ContractTable from './Components/ContractTable';
import ContractDetailModal from './Components/ContractDetailModal';

function GetAllDealerContractPage() {
    // State quản lý dữ liệu và UI
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedContract, setSelectedContract] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    // Load danh sách hợp đồng khi component mount
    useEffect(() => {
        loadContracts();
    }, []);

    // Hàm tải danh sách hợp đồng từ API
    async function loadContracts() {
        try {
            setLoading(true);
            setError(null);

            const data = await GetAllDealerContract.getAllDealerContracts();

            // Debug: Log dữ liệu trả về
            console.log('Raw data from API:', data);
            console.log('Is array?', Array.isArray(data));
            console.log('First item:', data[0]);
            console.log('First item ID:', data[0]?.id);

            if (Array.isArray(data)) {
                setContracts(data);
                message.success(`Tải thành công ${data.length} hợp đồng`);
            } else {
                setContracts([]);
                message.warning('Không có dữ liệu hợp đồng');
            }
        } catch (err) {
            console.error('Lỗi khi tải hợp đồng:', err);
            setError('Không thể tải danh sách hợp đồng. Vui lòng thử lại sau.');
            message.error('Lỗi khi tải danh sách hợp đồng');
        } finally {
            setLoading(false);
        }
    }

    // Hàm xử lý xem chi tiết hợp đồng
    function handleViewContract(contract) {
        console.log('Selected contract:', contract);
        console.log('Contract ID for modal:', contract?.id);
        setSelectedContract(contract);
        setModalVisible(true);
    }

    // Hàm đóng modal
    function handleCloseModal() {
        setModalVisible(false);
        setSelectedContract(null);
    }

    return (
        <AdminLayout>
            <PageContainer
                title="Quản lý hợp đồng đại lý"
                subTitle="Xem và quản lý tất cả hợp đồng với đại lý"
                extra={[
                    <FileTextOutlined key="icon" className="text-2xl text-blue-500" />,
                ]}
                className="bg-gradient-to-br from-blue-50 to-white"
            >
                {/* Hiển thị lỗi nếu có */}
                {error && (
                    <Alert
                        message="Lỗi"
                        description={error}
                        type="error"
                        showIcon
                        closable
                        className="mb-4"
                    />
                )}

                {/* Thống kê hợp đồng */}
                {!loading && contracts.length > 0 && (
                    <ContractStatistics contracts={contracts} />
                )}

                {/* Bảng danh sách hợp đồng */}
                <Card className="shadow-sm">
                    <ContractTable
                        contracts={contracts}
                        loading={loading}
                        onView={handleViewContract}
                    />
                </Card>

                {/* Modal chi tiết hợp đồng */}
                <ContractDetailModal
                    visible={modalVisible}
                    contractId={selectedContract?.id}
                    onClose={handleCloseModal}
                />
            </PageContainer>
        </AdminLayout>
    );
}

export default GetAllDealerContractPage;
