import api from "../../../api/api";

export const getAllEVBookingsAdmin = async () => {
    try {
        console.log("Fetching all bookings for admin...");

        const response = await api.get("/BookingEV/get-all-bookings", {
            params: {
                pageNumber: 1,
                pageSize: 100,
            }
        });

        console.log("Admin API raw response:", response);
        console.log("Admin API response data:", response.data);

        return response.data;
    } catch (error) {
        console.error("Error fetching all EV bookings for admin:", error);
        console.error("Error details:", error.response?.data || error.message);
        throw error;
    }
};

// Hàm lấy booking theo ID (dùng cho chi tiết)
export const getBookingByIdAdmin = async (bookingId) => {
    try {
        const response = await api.get(`/BookingEV/get-booking-by-id/${bookingId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching booking by ID:", error);
        throw error;
    }
};