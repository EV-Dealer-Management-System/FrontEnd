import api from "../../../api/api.js";
import { useState, useCallback, useEffect } from 'react';


// Hook lấy danh sách hợp đồng booking với filter
const useFetchContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: null,
    search: '',
  });

  // Hàm gọi API lấy danh sách hợp đồng
  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        pageNumber: 1,
        pageSize: 10000,
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

      setContracts(contractList);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách hợp đồng:', error);
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