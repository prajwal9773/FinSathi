import React, { useState } from 'react';
import { Upload, FileImage, FileText, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { uploadReceipt, extractFromPDF } from '../../services/api';

const ReceiptUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadType, setUploadType] = useState('receipt'); // 'receipt' or 'statement'
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024 * 2; // 20MB
      if (file.size > maxSize) {
        setError('File size must be less than 20MB');
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only image files (JPEG, PNG) and PDF files are allowed');
        return;
      }
      setSelectedFile(file);
      setError('');
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    const formData = new FormData();

    try {
      if (uploadType === 'receipt') {
        formData.append('receipt', selectedFile);
        const response = await uploadReceipt(formData);
        setResult({ type: 'single', data: response.data.data });
      } else {
        formData.append('pdf', selectedFile);
        const response = await extractFromPDF(formData);
        setResult({ type: 'multiple', data: response.data.data });
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Upload Receipt</h1>
          <p className="mt-1 text-sm text-gray-600">
            Upload receipts or bank statements to automatically extract transaction data
          </p>
        </div>

        <div className="px-6 py-4">
          {/* Upload Type */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setUploadType('receipt')}
              className={`p-3 text-center border rounded-md ${
                uploadType === 'receipt'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FileImage className="h-6 w-6 mx-auto mb-2" />
              <div className="font-medium">Single Receipt</div>
              <div className="text-xs text-gray-500">Image or PDF receipt</div>
            </button>
            <button
              type="button"
              onClick={() => setUploadType('statement')}
              className={`p-3 text-center border rounded-md ${
                uploadType === 'statement'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FileText className="h-6 w-6 mx-auto mb-2" />
              <div className="font-medium">Bank Statement</div>
              <div className="text-xs text-gray-500">PDF with multiple transactions</div>
            </button>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {uploadType === 'receipt' ? 'Receipt File' : 'Bank Statement PDF'}
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                    <span>Upload a file</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept={uploadType === 'receipt' ? 'image/*,application/pdf' : 'application/pdf'}
                      onChange={handleFileSelect}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  {uploadType === 'receipt' ? 'PNG, JPG, PDF up to 20MB' : 'PDF up to 20MB'}
                </p>
              </div>
            </div>
            {selectedFile && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  {selectedFile.type.startsWith('image/') ? (
                    <FileImage className="h-5 w-5 text-gray-400 mr-2" />
                  ) : (
                    <FileText className="h-5 w-5 text-gray-400 mr-2" />
                  )}
                  <span className="text-sm text-gray-700">{selectedFile.name}</span>
                  <span className="ml-auto text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024 / 2).toFixed(2)} MB
                  </span>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4 flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <span className="ml-3 text-sm text-red-800">{error}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center">
                <Loader className="animate-spin h-4 w-4 mr-2" /> Processing...
              </div>
            ) : (
              `Upload ${uploadType === 'receipt' ? 'Receipt' : 'Statement'}`
            )}
          </button>

          {/* Single transaction result */}
          {result && result.type === 'single' && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <div className="mb-4 rounded-md bg-green-50 p-4 flex">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="ml-3 text-sm text-green-800">Receipt processed successfully!</span>
              </div>
              <div className="bg-gray-50 rounded-md p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Amount:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(result.data.transaction.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Category:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {result.data.transaction.category}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Description:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {result.data.transaction.description}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Date:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(result.data.transaction.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Multiple transactions result */}
          {result && result.type === 'multiple' && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <div className="mb-4 rounded-md bg-green-50 p-4 flex">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="ml-3 text-sm text-green-800">
                  Successfully extracted {result.data.count} transactions!
                </span>
              </div>
              <div className="bg-gray-50 rounded-md p-4 max-h-64 overflow-y-auto space-y-3">
                {result.data.transactions.map((transaction, index) => (
                  <div key={index} className="bg-white p-3 rounded border grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Amount:</span>
                      <span className="ml-1 font-medium">{formatCurrency(transaction.amount)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <span
                        className={`ml-1 font-medium ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {transaction.type}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <span className="ml-1 font-medium">{transaction.category}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Date:</span>
                      <span className="ml-1 font-medium">
                        {new Date(transaction.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Description:</span>
                      <span className="ml-1 font-medium">{transaction.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptUpload;
