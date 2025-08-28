// Authentication endpoints
// export const resendVerificationEmail = async (email) => {
//   try {
//     console.log("API call - Gửi email đến:", email);
//     const response = await api.post("/auth/resend-verification", { email });
//     console.log("API response:", response);
//     return response.data;
//   } catch (error) {
//     console.error("API error:", error);
//     if (error.response) {
//       console.error("Error response:", error.response.data);
//       throw error.response.data;
//     }
//     throw error;
//   }
// };