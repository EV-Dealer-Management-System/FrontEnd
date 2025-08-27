import api from "../../../api/api";

export const register = async (email, password) => {
    const response = await api.post("/register", { email, password });
    return response.data;
};
