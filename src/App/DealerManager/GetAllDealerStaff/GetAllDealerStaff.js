import api from "../../../api/api";

export async function getAllDealerStaff({
  filterOn,
  filterQuery,
  sortBy,
  isAcsending,
  pageNumber = 1,
  pageSize = 10,
}) {
  const response = await api.get("/Dealer/get-all-dealer-staff", {
    params: {
      filterOn,
      filterQuery,
      sortBy,
      isAcsending,
      pageNumber,
      pageSize,
    },
  });
  return response.data;
}

export const createDealerStaff = async (data) => {
    const response = await api.post("/Dealer/create-dealer-staff", data, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.data;
}

export const toggleDealerStaffStatus = async (email) => {
  const response = await api.post(`/Dealer/toggle-staff-status`, { email });
  return response.data;
}