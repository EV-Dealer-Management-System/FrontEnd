import api from "../../../api/api";

export const cancelEVBooking = async (bookingId) => {
  try {
    const response = await api.delete(`/BookingEV/cancel-booking/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error("Error cancelling EV booking:", error);
    throw error;
  }
};
