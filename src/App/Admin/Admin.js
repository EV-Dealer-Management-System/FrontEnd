import api from "../../api/api";

export const getTotalCustomer = async () => {
  const response = await api.get("/DashBoard/total-customer");
  return response.data;
};

export const getTotalProduct = async () => {
  const response = await api.get("/DashBoard/total-product");
  return response.data;
};
// Do not export the Admin component from here to avoid circular imports
