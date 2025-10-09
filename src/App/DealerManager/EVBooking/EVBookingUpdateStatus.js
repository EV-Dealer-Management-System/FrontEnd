import api from "../../../api/api";

const EVBookingUpdateStatus = async (bookingId, newStatus) => {
    try {
        const response = await api.put(`/BookingEV/update-booking-status/${bookingId}?newStatus=${newStatus}`);
        return response.data;
    } catch (error) {
        console.error("Error updating EV booking status:", error);
        throw error;
    }
};

export default EVBookingUpdateStatus;
