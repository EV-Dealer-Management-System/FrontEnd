import api from "../../../api/api.js";
import { useState, useCallback, useEffect } from 'react';
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { notification } from 'antd';

// Mở rộng dayjs với plugin isoWeek
dayjs.extend(isoWeek);

// Hook lấy danh sách hợp đồng booking với filter
const useFetchContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: null,
    search: '',
    dateRange: null,
  });

  const filterByDateRange = (list) => {
    if (!filters.dateRange) return list;
    let startDate, endDate;
    switch (filters.dateRange) {
      case 'today':
        startDate = dayjs().startOf('day');
        endDate = dayjs().endOf('day');
        break;
      case 'thisWeek':
        startDate = dayjs().startOf('isoWeek');
        endDate = dayjs().endOf('isoWeek');
        break;
      case 'thisMonth':
        startDate = dayjs().startOf('month');
        endDate = dayjs().endOf('month');
        break;
      default:
        return list;
    }

    return list.filter(item => {
      const contractDate = dayjs(item.createdAt);
      return contractDate.isAfter(startDate) && contractDate.isBefore(endDate);
    });
  };

  // Hàm gọi API lấy danh sách hợp đồng
  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        pageNumber: 1,
        pageSize: 10000,
        eContractStatus: 1,
        econtractType: 2, // Loại booking
      };

      // Thêm filter status nếu có
      if (filters.status !== null) {
        params.eContractStatus = filters.status;
      }

      const response = await api.get('/EContract/get-all-econtract-list', { params });
      
      let contractList = response.data.result || [];

      // Filter theo search name/no
      if (filters.search.trim()) {
        const searchTerm = filters.search.toLowerCase();
        contractList = contractList.filter(contract => 
          contract.name?.toLowerCase().includes(searchTerm) ||
          contract.id?.toLowerCase().includes(searchTerm)
        );
      }
      // Filter theo date range
      contractList = filterByDateRange(contractList);
      setContracts(contractList);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách hợp đồng:', error);
       // ✅ Hiển thị popup lỗi
      notification.error({
        message: 'Lỗi tải danh sách hợp đồng',
        description: error?.message || 'Không thể tải danh sách. Vui lòng thử lại sau!',
        duration: 4,
        placement: 'topRight',
      });
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Hàm reload danh sách
  const reload = useCallback(() => {
    fetchContracts();
  }, [fetchContracts]);

  // Hàm cập nhật filter
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Load lần đầu
  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  return {
    contracts,
    loading,
    filters,
    updateFilter,
    reload
  };
};

export default useFetchContracts;