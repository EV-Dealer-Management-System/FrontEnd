import api from "../../../Api/Api";

export const register = async (email, password, confirmPassword, fullName) => {
  const response = await api.post("/Auth/register-customer", {
    fullName,
    email,
    password,
    confirmPassword,
  });
  return response.data;
};