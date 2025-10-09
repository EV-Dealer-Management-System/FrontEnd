import api from "../../../api/api";
export const approveEVBooking = async (bookingId) => {
  try {
    const response = await api.post(`/BookingEV/approve-booking/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error("Error approving EV booking:", error);
    throw error;
  }
};
