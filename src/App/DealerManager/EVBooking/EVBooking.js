import api from "../../../api/api";

export const createEVBooking = async (note, bookingDetails) => {
  const payload = {
    note: note,
    bookingDetails: bookingDetails.map(detail => ({
      versionId: detail.versionId,
      colorId: detail.colorId,
      quantity: detail.quantity
    }))
  };
  console.log("Sending booking data:", JSON.stringify(payload, null, 2));

  const response = await api.post("/BookingEV/create-booking", payload);
  return response;
};
