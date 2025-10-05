import React, { useEffect, useState } from 'react';
import { Spin, Alert } from 'antd';

// Component kiểm tra SmartCA của user
function SmartCAStatusChecker({ userId, contractService, onChecked }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [smartCAInfo, setSmartCAInfo] = useState(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    contractService.handleCheckSmartCA(userId)
      .then(result => {
        if (result.success) {
          setSmartCAInfo(result.data);
          if (onChecked) onChecked(result.data);
        } else {
          setError(result.error || 'Không kiểm tra được SmartCA');
        }
      })
      .catch(() => setError('Có lỗi khi kiểm tra SmartCA'))
      .finally(() => setLoading(false));
  }, [userId, contractService, onChecked]);

  if (loading) return <Spin tip="Đang kiểm tra SmartCA..." />;
  if (error) return <Alert type="error" message={error} showIcon />;
  return null; // Không render gì, chỉ trả về dữ liệu qua callback
}

export default SmartCAStatusChecker;
