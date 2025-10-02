import api from "../../../Api/api";

export const login = async (email, password, rememberMe = true) => {
  const response = await api.post("Auth/login-user", {
    email,
    password,
    rememberMe,
  });
  return response.data;
};
