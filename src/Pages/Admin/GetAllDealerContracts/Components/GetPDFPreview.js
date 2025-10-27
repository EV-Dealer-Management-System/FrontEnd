import api from '../../../../api/api';

const GetPDFPreview = async (downloadUrl) => {
  if (!downloadUrl) return null;

  try {
    // Gọi qua backend proxy tránh lỗi CORS
    const response = await api.get('/EContract/preview', {
      params: { downloadUrl },
      responseType: 'blob'
    });

    if (response.status === 200 && response.data) {
      // Tạo blob object từ response data
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(pdfBlob);
      console.log('✅ PDF preview loaded successfully');
      return blobUrl;
    } else {
      console.warn('⚠️ PDF preview API trả về dữ liệu rỗng hoặc lỗi trạng thái.');
      return null;
    }
  } catch (error) {
    console.error('❌ Lỗi khi tải PDF preview:', error);
    return null;
  }
};

export default GetPDFPreview;