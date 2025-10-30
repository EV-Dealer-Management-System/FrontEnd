import api from "../../../api/api";

export const getAllEVBookings = async () => {
  try {
    const response = await api.get("/BookingEV/get-all-bookings", {
      params: {
        pageNumber: 1,
        pageSize: 100, 
      }
    });
    console.log("DealerManager API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching all EV bookings:", error);
    throw error;
  }
};
