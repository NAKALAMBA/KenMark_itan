'use client';

import { useState } from 'react';
import { Upload, BarChart3, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface AnalyticsData {
  question: string;
  count: number;
}

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadResult({ success: false, message: 'Please select a file' });
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadResult({
          success: true,
          message: data.message,
          count: data.count,
        });
        setFile(null);
        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setUploadResult({
          success: false,
          message: data.error || 'Upload failed',
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadResult({
        success: false,
        message: 'An error occurred during upload',
      });
    } finally {
      setUploading(false);
    }
  };

  const loadAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const response = await fetch('/api/admin/analytics');
      const data = await response.json();
      if (response.ok) {
        setAnalytics(data.questions || []);
      }
    } catch (error) {
      console.error('Analytics error:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <Link
              href="/"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Back to Home
            </Link>
          </div>

          {/* Upload Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <FileSpreadsheet size={24} />
              Upload Knowledge Base
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Upload an Excel file (.xlsx) containing FAQs, Services, and About information.
              The file should have columns: Category, Question (optional), and Answer.
            </p>

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 mb-4">
              <div className="flex flex-col items-center justify-center">
                <Upload size={48} className="text-gray-400 mb-4" />
                <label
                  htmlFor="file-input"
                  className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors inline-block"
                >
                  Choose Excel File
                </label>
                <input
                  id="file-input"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {file && (
                  <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                    Selected: <span className="font-semibold">{file.name}</span>
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Upload File
                </>
              )}
            </button>

            {uploadResult && (
              <div
                className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${
                  uploadResult.success
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}
              >
                {uploadResult.success ? (
                  <CheckCircle size={20} className="text-green-600 dark:text-green-400 mt-0.5" />
                ) : (
                  <AlertCircle size={20} className="text-red-600 dark:text-red-400 mt-0.5" />
                )}
                <div>
                  <p
                    className={`font-semibold ${
                      uploadResult.success
                        ? 'text-green-800 dark:text-green-300'
                        : 'text-red-800 dark:text-red-300'
                    }`}
                  >
                    {uploadResult.message}
                  </p>
                  {uploadResult.success && uploadResult.count !== undefined && (
                    <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                      {uploadResult.count} entries added to knowledge base
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Analytics Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <BarChart3 size={24} />
                Analytics
              </h2>
              <button
                onClick={loadAnalytics}
                disabled={loadingAnalytics}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loadingAnalytics ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Most frequently asked questions
            </p>

            {analytics.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
                <p>No analytics data yet. Click &quot;Refresh&quot; to load data.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {analytics.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white font-medium">
                        {item.question}
                      </p>
                    </div>
                    <div className="ml-4">
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-semibold">
                        {item.count} times
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

