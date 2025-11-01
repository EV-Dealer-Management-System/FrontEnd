import api from "../../../api/api";

export const EVBookingConfirmEContract = async (bookingId) => {
    try {
        const response = await api.post(`/EContract/create-booking-confirm-econtract?bookingId=${bookingId}`);
        console.log("EV booking confirm e-contract created:", response);
        return response;
    } catch (error) {
        console.error("Error creating EV booking confirm e-contract:", error);
        throw error;
    }
};