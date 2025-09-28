import api from "../../api/api";

export const getProfile = async () => {
    const response = await api.get("/Customer/get-customers-profile");
    console.log(response.data);
    return response.data;
}