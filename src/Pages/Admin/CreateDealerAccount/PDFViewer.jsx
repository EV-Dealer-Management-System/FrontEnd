import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Spin, Button } from 'antd';
import { FilePdfOutlined } from '@ant-design/icons';

// Cấu hình worker cho pdfjs

import workerSrc from '../../../../public/pdf.worker.min.js';

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

function PDFViewer({ contractLink, contractNo }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);

  // Khi load xong PDF
  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setLoading(false);
  }

  // Chuyển trang
  const goToPrevPage = () => setPageNumber(page => Math.max(page - 1, 1));
  const goToNextPage = () => setPageNumber(page => Math.min(page + 1, numPages));

  return (
    <div className="w-full flex flex-col items-center bg-white rounded-lg shadow-lg p-4">
      <div className="mb-2 font-semibold text-blue-600 flex items-center">
        <FilePdfOutlined className="mr-2" />
        {contractNo ? `Hợp đồng số: ${contractNo}` : 'Xem hợp đồng PDF'}
      </div>
      <div className="flex justify-center items-center min-h-[600px] bg-gray-50 rounded-lg border border-gray-200">
        {loading && <Spin tip="Đang tải PDF..." />}
        <Document
          file={contractLink}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<Spin tip="Đang tải PDF..." />}
          error={<div className="text-red-500">Không thể tải PDF</div>}
        >
          <Page pageNumber={pageNumber} width={900} />
        </Document>
      </div>
      {numPages && (
        <div className="flex items-center justify-center mt-4 gap-4">
          <Button onClick={goToPrevPage} disabled={pageNumber <= 1}>
            Trang trước
          </Button>
          <span>
            Trang {pageNumber} / {numPages}
          </span>
          <Button onClick={goToNextPage} disabled={pageNumber >= numPages}>
            Trang sau
          </Button>
        </div>
      )}
      <div className="mt-4">
        <Button
          type="primary"
          icon={<FilePdfOutlined />}
          href={contractLink}
          target="_blank"
        >
          Tải xuống PDF
        </Button>
      </div>
    </div>
  );
}

export default PDFViewer;