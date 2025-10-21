import React, { useState, useEffect } from 'react';
import { X, Download, Printer } from 'lucide-react';

interface InvoicePDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfDataUrl: string | null;
  invoiceNumber: string;
}

export const InvoicePDFPreviewModal: React.FC<InvoicePDFPreviewModalProps> = ({
  isOpen,
  onClose,
  pdfDataUrl,
  invoiceNumber,
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  // Convert data URL to blob URL for better browser compatibility
  useEffect(() => {
    if (pdfDataUrl && pdfDataUrl.startsWith('data:application/pdf')) {
      try {
        // Extract base64 data from data URL
        const base64Data = pdfDataUrl.split(',')[1];
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        
        console.log('Created blob URL for PDF preview');
        
        // Cleanup function
        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (error) {
        console.error('Error converting PDF data to blob:', error);
      }
    }
  }, [pdfDataUrl]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!pdfDataUrl) return;
    
    try {
      // Use the blob URL if available, otherwise fall back to data URL
      const downloadUrl = blobUrl || pdfDataUrl;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const handlePrint = () => {
    if (!pdfDataUrl && !blobUrl) return;
    
    try {
      const printUrl = blobUrl || pdfDataUrl;
      if (!printUrl) return;
      
      const printWindow = window.open(printUrl, '_blank');
      if (printWindow) {
        printWindow.focus();
        // Wait for PDF to load then print
        setTimeout(() => {
          printWindow.print();
        }, 1500);
      }
    } catch (error) {
      console.error('Error printing PDF:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-6xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Invoice Actions - {invoiceNumber}
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDownload}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 border border-transparent rounded-md hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Printer className="w-4 h-4 mr-1" />
                Print
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* PDF Viewer */}
          <div className="border border-gray-300 rounded-lg bg-gray-50" style={{ height: '80vh' }}>
            {pdfDataUrl ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                  <div className="mb-6">
                    <svg className="w-20 h-20 mx-auto text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Invoice {invoiceNumber}</h3>
                  <p className="text-gray-600 mb-6">Your invoice is ready for preview and download.</p>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        if (blobUrl) {
                          window.open(blobUrl, '_blank');
                        }
                      }}
                      disabled={!blobUrl}
                      className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      {blobUrl ? 'Open PDF in New Tab' : 'Preparing PDF...'}
                    </button>
                    
                    <button
                      onClick={handleDownload}
                      className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download PDF
                    </button>
                    
                    <button
                      onClick={handlePrint}
                      className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Printer className="w-5 h-5 mr-2" />
                      Print PDF
                    </button>
                  </div>
                  
                  <div className="mt-6 text-sm text-gray-500 bg-blue-50 p-3 rounded-md">
                    <p className="font-medium text-blue-800 mb-1">💡 Browser Security Notice</p>
                    <p>Due to browser security settings, PDFs open in a new tab for better compatibility.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading PDF...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};