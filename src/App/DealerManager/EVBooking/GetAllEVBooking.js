import api from "../../../api/api";

export const getAllEVBookings = async () => {
  try {
    const response = await api.get("/BookingEV/get-all-bookings");
    return response.data;
  } catch (error) {
    console.error("Error fetching all EV bookings:", error);
    throw error;
  }
};
