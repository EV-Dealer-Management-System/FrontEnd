import { useState, useCallback, useEffect } from 'react';
import api from '../../../../api/api';
import { message } from 'antd';

// Hook quản lý danh sách booking cho Dealer Manager
const useBookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: null,
  });

  // Mapping trạng thái booking
  const getStatusInfo = (status) => {
    const statusMap = {
      0: { label: 'Nháp', color: 'default', canSign: false },
      1: { label: 'Chờ xử lý', color: 'processing', canSign: true },
      2: { label: 'Chờ xử lý', color: 'processing', canSign: true },
      3: { label: 'Đang xử lý', color: 'warning', canSign: false },
      4: { label: 'Thành công', color: 'success', canSign: false },
      '-1': { label: 'Từ chối', color: 'error', canSign: false },
      '-2': { label: 'Đã xóa', color: 'default', canSign: false },
      '-3': { label: 'Hủy', color: 'volcano', canSign: false }
    };
    return statusMap[status] || { label: 'Không xác định', color: 'default', canSign: false };
  };

  // Fetch danh sách booking
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/BookingEV/get-all-bookings');
      
      let bookingList = response.data.result || [];

      // Filter theo search
      if (filters.search.trim()) {
        const searchTerm = filters.search.toLowerCase();
        bookingList = bookingList.filter(booking => 
          booking.id?.toLowerCase().includes(searchTerm) ||
          booking.note?.toLowerCase().includes(searchTerm) ||
          booking.createdBy?.toLowerCase().includes(searchTerm)
        );
      }

      // Filter theo status
      if (filters.status !== null) {
        bookingList = bookingList.filter(booking => booking.status === filters.status);
      }

      // Enrich data với status info
      bookingList = bookingList.map(booking => ({
        ...booking,
        statusInfo: getStatusInfo(booking.status)
      }));

      setBookings(bookingList);
      
    } catch (error) {
      console.error('Lỗi khi lấy danh sách booking:', error);
      message.error('Không thể tải danh sách booking');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Cập nhật filter
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Reload danh sách
  const reload = useCallback(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Load lần đầu
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    bookings,
    loading,
    filters,
    updateFilter,
    reload,
    getStatusInfo
  };
};

export default useBookingList;