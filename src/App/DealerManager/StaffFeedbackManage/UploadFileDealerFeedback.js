import api from "../../../api/api";
export const UploadFileDealerFeedback = {
    uploadFileDealerFeedback: async (fileData) => {
        try {
            const response = await api.post("/DealerFeedback/upload-file-url-dealer-feedback", fileData);
            return response.data;
        } catch (error) {
            console.error("Error uploading file dealer feedback:", error);
            throw error;
        }
    }
};