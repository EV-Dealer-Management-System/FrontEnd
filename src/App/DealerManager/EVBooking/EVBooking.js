import api from "../../../api/api";

// Tạo đơn đặt xe điện mới
export const createEVBooking = async (dealerId, note, bookingDetails) => {
  // Chuẩn bị payload theo đúng format API
  const payload = {
    dealerId: dealerId,
    note: note,
    bookingDetails: bookingDetails.map(detail => ({
      versionId: detail.versionId,
      colorId: detail.colorId,
      quantity: detail.quantity
    }))
  };

  // Log để kiểm tra format (có thể xóa sau khi test xong)
  console.log("Sending booking data:", JSON.stringify(payload, null, 2));

  const response = await api.post("/BookingEV/create-booking", payload);
  return response;
};
