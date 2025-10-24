import api from "../../../api/api";

export const GetAllEVDealer = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams();
        if (params.filterOn) queryParams.append('filterOn', params.filterOn);
        if (params.filterQuery) queryParams.append('filterQuery', params.filterQuery);
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.isAscending !== undefined) queryParams.append('isAscending', params.isAscending);
        if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber);
        if (params.pageSize) queryParams.append('pageSize', params.pageSize);
        const url = `/Dealer/get-all-dealers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error("Error fetching EV dealers:", error);
        throw error;
    }
};
