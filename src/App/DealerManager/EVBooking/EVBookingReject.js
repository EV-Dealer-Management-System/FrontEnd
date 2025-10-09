import api from "../../../api/api";
export const rejectEVBooking = async (bookingId) => {
  try { 
    const response = await api.post(`/BookingEV/reject-booking/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error("Error rejecting EV booking:", error);
    throw error;
  }     
};
