import api from "../../../api/api.js"; 

const getPdfPreview = async (downloadUrl) => {
    if (!downloadUrl) return null;
    
    try {
      const response = await api.get('/EContract/preview', {
        params: { downloadUrl },     
        responseType: 'blob'         
      });

      if (response.status === 200) {
        const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(pdfBlob);
        return blobUrl;
        }
        return null;
    } catch (err) {
      console.error('Lỗi khi tải PDF preview:', err);
      message.error('Lỗi khi tải xem trước PDF');
      throw err;
    }
  };

export default getPdfPreview;
