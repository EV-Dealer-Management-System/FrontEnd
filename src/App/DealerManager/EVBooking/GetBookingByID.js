import api from "../../../api/api";

export const getBookingById = async (bookingId) => {
  try {
    const response = await api.get(`/BookingEV/get-booking-by-id/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching booking by ID:", error);
    throw error;
  }
};
