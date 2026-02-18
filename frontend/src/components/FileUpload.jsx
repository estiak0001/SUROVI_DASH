import React, { useState, useCallback, useEffect } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, Loader, Calendar, Info, AlertTriangle, RefreshCw, Download } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = '/surovidash/api';

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' }
];

const YEARS = [2023, 2024, 2025, 2026];

const FileUpload = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [sampleFormat, setSampleFormat] = useState(null);
  const [showSampleFormat, setShowSampleFormat] = useState(false);
  
  // Month/Year override options
  const [useCustomDate, setUseCustomDate] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Fetch sample format on mount
  useEffect(() => {
    const fetchSampleFormat = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/upload/sample-format`);
        setSampleFormat(response.data);
      } catch (err) {
        console.error('Failed to fetch sample format:', err);
      }
    };
    fetchSampleFormat();
  }, []);

  // Download template function
  const handleDownloadTemplate = async (templateType) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/upload/template/${templateType}`, {
        responseType: 'blob'
      });
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = templateType === 'sales_collection' 
        ? 'Sales_Collection_Template.xlsx' 
        : 'Product_Comparison_Template.xlsx';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename=(.+)/);
        if (filenameMatch) {
          filename = filenameMatch[1].replace(/"/g, '');
        }
      }
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download template:', err);
      alert('Failed to download template. Please try again.');
    }
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls'))) {
      setFile(droppedFile);
      setError(null);
      setUploadResult(null);
    } else {
      setError('Please upload an Excel file (.xlsx or .xls)');
    }
  }, []);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Add month/year if custom date is selected
      if (useCustomDate) {
        formData.append('month', selectedMonth);
        formData.append('year', selectedYear);
      }

      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setUploadResult(response.data);
      setFile(null);
      if (onUploadSuccess) {
        onUploadSuccess(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const detectFileType = (filename) => {
    const lower = filename.toLowerCase();
    if (lower.includes('sales') && lower.includes('collection')) {
      return 'Sales & Collection';
    } else if (lower.includes('product') || lower.includes('comparison')) {
      return 'Product Comparison';
    }
    return 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Main Upload Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-400">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-blue-600" />
          Upload Dashboard Data
        </h2>

        {/* Month/Year Override Option */}
        <div className="mb-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
          <div className="flex items-center gap-3 mb-3">
            <input
              type="checkbox"
              id="customDate"
              checked={useCustomDate}
              onChange={(e) => setUseCustomDate(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="customDate" className="text-sm font-semibold text-gray-800">
              Specify Month & Year manually
            </label>
            <span className="text-xs text-gray-600">(otherwise extracted from filename/file content)</span>
          </div>
          
          {useCustomDate && (
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="border-2 border-gray-400 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {MONTHS.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="border-2 border-gray-400 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {YEARS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          )}
          
          <div className="mt-3 flex items-start gap-2 text-xs text-amber-800 bg-amber-100 p-3 rounded-lg border border-amber-300">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Note:</strong> If data already exists for the selected month/year, it will be <strong>replaced</strong> with the new upload.
            </span>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-100'
              : 'border-gray-400 hover:border-blue-500 hover:bg-blue-50'
          }`}
        >
          <FileSpreadsheet className="w-12 h-12 mx-auto text-blue-500 mb-4" />
          <p className="text-gray-800 font-medium mb-2">
            Drag and drop your Excel file here, or
          </p>
          <label className="cursor-pointer">
            <span className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block font-semibold shadow-md">
              Browse Files
            </span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
          <p className="text-sm text-gray-600 mt-3 font-medium">
            Supports: .xlsx, .xls files
          </p>
        </div>

        {/* Selected File */}
        {file && (
          <div className="mt-4 p-4 bg-blue-100 rounded-lg border-2 border-blue-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-10 h-10 text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-700 font-medium">
                    {(file.size / 1024).toFixed(2)} KB • Detected: {detectFileType(file.name)}
                  </p>
                  {useCustomDate && (
                    <p className="text-sm text-blue-700 font-semibold">
                      → Will upload as: {MONTHS.find(m => m.value === selectedMonth)?.label} {selectedYear}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFile(null)}
                  className="px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center gap-2 font-semibold shadow-md"
                >
                  {uploading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload & Process
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {uploadResult && (
          <div className="mt-4 p-4 bg-green-100 border-2 border-green-300 rounded-lg">
            <div className="flex items-center gap-2 text-green-800 mb-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-bold">Upload Successful!</span>
            </div>
            <p className="text-green-800 font-medium mb-3">{uploadResult.message}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="bg-white p-3 rounded-lg border-2 border-green-200">
                <p className="text-gray-600 text-xs font-semibold">File Type</p>
                <p className="font-bold text-gray-900">{uploadResult.file_type}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border-2 border-green-200">
                <p className="text-gray-600 text-xs font-semibold">Records Inserted</p>
                <p className="font-bold text-gray-900">{uploadResult.records_processed}</p>
              </div>
              {uploadResult.details?.month_name && (
                <div className="bg-white p-3 rounded-lg border-2 border-green-200">
                  <p className="text-gray-600 text-xs font-semibold">Period</p>
                  <p className="font-bold text-gray-900">{uploadResult.details.month_name} {uploadResult.details.year}</p>
                </div>
              )}
              {uploadResult.details?.deleted_records > 0 && (
                <div className="bg-white p-3 rounded-lg border-2 border-orange-300">
                  <p className="text-gray-600 text-xs font-semibold">Replaced</p>
                  <p className="font-bold text-orange-600">{uploadResult.details.deleted_records} old records</p>
                </div>
              )}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900 font-semibold"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Dashboard
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-100 border-2 border-red-300 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <XCircle className="w-5 h-5" />
              <span className="font-bold">Upload Failed</span>
            </div>
            <p className="text-red-800 font-medium mt-1">{error}</p>
          </div>
        )}
      </div>

      {/* Sample Format Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <button
          onClick={() => setShowSampleFormat(!showSampleFormat)}
          className="flex items-center gap-2 text-lg font-semibold text-gray-800 hover:text-blue-600 w-full text-left"
        >
          <Info className="w-5 h-5 text-blue-600" />
          Sample File Formats
          <span className="ml-auto text-sm font-normal text-blue-600">
            {showSampleFormat ? '▼ Hide' : '▶ Show'}
          </span>
        </button>

        {showSampleFormat && sampleFormat && (
          <div className="mt-4 space-y-6">
            {/* Sales Collection Format */}
            <div className="border border-blue-200 rounded-lg overflow-hidden">
              <div className="bg-blue-50 px-4 py-3 border-b border-blue-200 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-blue-800">📊 Sales & Collection File</h4>
                  <p className="text-sm text-blue-600 mt-1">{sampleFormat.sales_collection?.description}</p>
                </div>
                <button
                  onClick={() => handleDownloadTemplate('sales_collection')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  Download Template
                </button>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Filename:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{sampleFormat.sales_collection?.filename_format}</code>
                </p>
                <p className="text-sm font-medium text-gray-700 mb-2">Required Columns:</p>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-1 text-left">Column</th>
                        <th className="px-2 py-1 text-left">Field</th>
                        <th className="px-2 py-1 text-left">Example</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {sampleFormat.sales_collection?.columns?.map((col, idx) => (
                        <tr key={idx}>
                          <td className="px-2 py-1 font-mono text-blue-600">{col.col}</td>
                          <td className="px-2 py-1">{col.name}</td>
                          <td className="px-2 py-1 text-gray-500">{col.example}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
                  <strong>Notes:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {sampleFormat.sales_collection?.notes?.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Product Comparison Format */}
            <div className="border border-green-200 rounded-lg overflow-hidden">
              <div className="bg-green-50 px-4 py-3 border-b border-green-200 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-green-800">📈 Product Comparison File</h4>
                  <p className="text-sm text-green-600 mt-1">{sampleFormat.product_comparison?.description}</p>
                </div>
                <button
                  onClick={() => handleDownloadTemplate('product_comparison')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  Download Template
                </button>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Filename:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{sampleFormat.product_comparison?.filename_format}</code>
                </p>
                
                {sampleFormat.product_comparison?.sheets?.map((sheet, idx) => (
                  <div key={idx} className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Sheet: "{sheet.name}"</p>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-2 py-1 text-left">Column</th>
                            <th className="px-2 py-1 text-left">Field</th>
                            <th className="px-2 py-1 text-left">Example</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {sheet.columns?.map((col, cidx) => (
                            <tr key={cidx}>
                              <td className="px-2 py-1 font-mono text-green-600">{col.col}</td>
                              <td className="px-2 py-1">{col.name}</td>
                              <td className="px-2 py-1 text-gray-500">{col.example}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
                
                <div className="mt-3 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
                  <strong>Notes:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {sampleFormat.product_comparison?.notes?.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
