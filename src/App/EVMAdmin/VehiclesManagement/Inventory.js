import api from "../../../api/api";
import axios from "axios";
import { GetAllEVInventory } from "../../DealerStaff/EVInventory/GetAllEVInventory";

export const Inventory = {
    createInventory: async function (formData) {
          try {
              const apiData = {
                name: formData.name || '',
               location: formData.location || '',
            description: formData.description || '',
            isActive: formData.isActive ?? true,
            createdAt: new Date().toISOString(),
              };
              const response = await api.post("/EVCInventory/create-evcinventory", apiData);
              return response.data;
          } catch (error) {
              console.error("Error creating staff account:", error);
              throw error;
          }
      },
    getAllEVCInventory: async function () {
        try {
            const response = await api.get("/EVCInventory/get-all-evcinventories");
            console.log("🔍 API Raw Response:", response);
            console.log("🔍 Response Data:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching EV inventory:", error);
            throw error;
        }
    }
};
