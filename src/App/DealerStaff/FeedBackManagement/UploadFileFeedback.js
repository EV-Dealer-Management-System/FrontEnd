import api from "../../../api/api";
export const UploadFileFeedback = {
    uploadFileFeedback: async (fileData) => {
        try {
            const response = await api.post("/CustomerFeedback/upload-file-url-customer-feedback", fileData);
            return response.data;
        } catch (error) {
            console.error("Error uploading file feedback:", error);
            throw error;
        }
    }
};