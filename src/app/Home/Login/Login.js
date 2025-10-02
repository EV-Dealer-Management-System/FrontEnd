import api from "../../../Api/Api";

export const Login = async (email, password, rememberMe = true) => {
  const response = await api.post("Auth/login-user", {
    email,
    password,
    rememberMe,
  });
  return response.data;
};
