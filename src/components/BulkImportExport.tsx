'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Download, Upload, AlertCircle, CheckCircle, X, FileText, Loader2 } from 'lucide-react';

interface BulkImportExportProps {
  assetType: 'FURNITURE' | 'ELECTRONIC' | 'VEHICLE';
  onImportSuccess?: () => void;
}

export default function BulkImportExport({ assetType, onImportSuccess }: BulkImportExportProps) {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number; errors: any[] } | null>(null);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Manage body class to hide sticky headers when modal is open
  useEffect(() => {
    if (showModal && typeof document !== 'undefined') {
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
      };
    }
  }, [showModal]);

  const handleExport = async () => {
    setExporting(true);
    setError('');

    try {
      const res = await fetch(`/api/bulk-export?assetType=${assetType}`);
      const json = await res.json();

      if (json.success) {
        // Download CSV file
        const blob = new Blob([json.data.csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${assetType.toLowerCase()}_assets_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Close modal after successful export
        setTimeout(() => {
          setShowModal(false);
        }, 1000);
      } else {
        setError(json.error || 'Failed to export');
      }
    } catch {
      setError('Failed to export assets');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    if (!csvFile) {
      setError('Please select a CSV file');
      return;
    }

    setImporting(true);
    setError('');
    setResult(null);

    try {
      const text = await csvFile.text();
      const lines = text.split('\n').filter((line) => line.trim());

      if (lines.length < 2) {
        setError('CSV file is empty or invalid');
        setImporting(false);
        return;
      }

      const headers = lines[0].split(',').map((h) => h.replace(/"/g, '').trim());

      const assets = lines.slice(1).map((line) => {
        const values = line.split(',').map((v) => v.replace(/"/g, '').trim());
        const asset: any = {};
        headers.forEach((header, index) => {
          asset[header] = values[index] || '';
        });
        return asset;
      });

      const res = await fetch('/api/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetType, assets }),
      });

      const json = await res.json();
      if (json.success) {
        setResult({
          success: json.data.created,
          failed: json.data.failed,
          errors: json.data.errors,
        });
        if (onImportSuccess) onImportSuccess();
        setCsvFile(null);
      } else {
        setError(json.error || 'Failed to import');
      }
    } catch (err) {
      setError('Failed to import assets. Please check your CSV format.');
    } finally {
      setImporting(false);
    }
  };

  const getSampleCSV = () => {
    const samples: Record<string, string> = {
      FURNITURE: 'assetName,furnitureType,material,purchaseDate,purchasePrice,condition,status,usefulLifeYears,salvageValue\nOffice Desk,Wood,Wood,2024-01-15,15000,GOOD,IN_STORE,10,1500',
      ELECTRONIC: 'assetName,deviceType,brand,model,purchaseDate,purchasePrice,warrantyEndDate,condition,status,usefulLifeYears,salvageValue\nLaptop,Laptop,Dell,Latitude 5520,2024-01-15,85000,2027-01-15,GOOD,IN_STORE,5,8500',
      VEHICLE: 'assetName,vehicleType,brand,model,registrationNumber,fuelType,purchaseDate,condition,status,usefulLifeYears,salvageValue\nCompany Car,Sedan,Toyota,Corolla,ABC-1234,Petrol,2024-01-15,GOOD,IN_STORE,10,150000',
    };
    return samples[assetType] || '';
  };

  const downloadSample = () => {
    const blob = new Blob([getSampleCSV()], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sample_${assetType.toLowerCase()}_assets.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setShowModal(true); setActiveTab('import'); }}
          className="btn btn-success btn-sm"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Import CSV</span>
          <span className="sm:hidden">Import</span>
        </button>
        <button
          onClick={() => { setShowModal(true); setActiveTab('export'); }}
          className="btn btn-primary btn-sm"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export CSV</span>
          <span className="sm:hidden">Export</span>
        </button>
      </div>

      {/* Modal */}
      {showModal && mounted && createPortal(
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal w-full max-w-2xl relative mx-auto" onClick={(e) => e.stopPropagation()}>
            {/* Loading overlay */}
            {(importing || exporting) && (
              <div className="import-export-loading">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="import-export-loading-text">
                  {importing ? 'Importing assets...' : 'Exporting assets...'}
                </p>
                <div className="import-export-progress">
                  <div className="import-export-progress-bar" style={{ width: '100%' }} />
                </div>
              </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Bulk Import/Export</h2>
                  <p className="text-sm text-slate-600 mt-0.5">
                    {assetType.charAt(0) + assetType.slice(1).toLowerCase()} Assets
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setResult(null);
                  setError('');
                  setCsvFile(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                disabled={importing || exporting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50">
              <button
                onClick={() => { setActiveTab('import'); setError(''); setResult(null); }}
                disabled={importing || exporting}
                className={`flex-1 py-3 px-4 font-semibold text-sm transition-all ${
                  activeTab === 'import'
                    ? 'text-blue-600 bg-white border-b-2 border-blue-600'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Upload className="w-4 h-4 inline mr-2" />
                Import
              </button>
              <button
                onClick={() => { setActiveTab('export'); setError(''); setResult(null); }}
                disabled={importing || exporting}
                className={`flex-1 py-3 px-4 font-semibold text-sm transition-all ${
                  activeTab === 'export'
                    ? 'text-blue-600 bg-white border-b-2 border-blue-600'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Download className="w-4 h-4 inline mr-2" />
                Export
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {activeTab === 'import' ? (
                <div className="space-y-4">
                  <div>
                    <label className="form-label required">
                      Upload CSV File
                    </label>
                    <div className="dropzone" onClick={() => document.getElementById('csv-upload')?.click()}>
                      <Upload className="dropzone-icon" />
                      <p className="dropzone-text font-semibold">
                        {csvFile ? csvFile.name : 'Click to select CSV file'}
                      </p>
                      <p className="dropzone-hint">
                        or drag and drop your file here
                      </p>
                    </div>
                    <input
                      id="csv-upload"
                      type="file"
                      accept=".csv"
                      onChange={(e) => {
                        setCsvFile(e.target.files?.[0] || null);
                        setError('');
                        setResult(null);
                      }}
                      className="hidden"
                      disabled={importing}
                    />
                  </div>

                  <button
                    onClick={downloadSample}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 hover:underline"
                    disabled={importing}
                  >
                    <Download className="w-4 h-4" />
                    Download Sample CSV Template
                  </button>

                  {error && (
                    <div className="flex items-start gap-3 text-red-700 text-sm bg-red-50 p-4 rounded-lg border border-red-200">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold mb-1">Import Error</p>
                        <p>{error}</p>
                      </div>
                    </div>
                  )}

                  {result && (
                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="flex items-center gap-2 mb-3 text-emerald-700 font-semibold">
                        <CheckCircle className="w-5 h-5" />
                        Import Complete
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="bg-white p-3 rounded-lg border border-emerald-200">
                          <p className="text-2xl font-bold text-emerald-600">{result.success}</p>
                          <p className="text-xs text-emerald-700 mt-1">Successfully Imported</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-red-200">
                          <p className="text-2xl font-bold text-red-600">{result.failed}</p>
                          <p className="text-xs text-red-700 mt-1">Failed</p>
                        </div>
                      </div>
                      {result.errors.length > 0 && (
                        <div className="mt-3 p-3 bg-white rounded-lg border border-red-200 max-h-40 overflow-y-auto">
                          <p className="text-xs font-semibold text-red-700 mb-2">Error Details:</p>
                          <div className="space-y-1">
                            {result.errors.slice(0, 10).map((err, i) => (
                              <p key={i} className="text-xs text-red-600">
                                • Row {err.row}: {err.error}
                              </p>
                            ))}
                            {result.errors.length > 10 && (
                              <p className="text-xs text-red-600 font-semibold mt-2">
                                ... and {result.errors.length - 10} more errors
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={handleImport}
                    disabled={importing || !csvFile}
                    className="btn btn-success w-full py-3 text-base"
                  >
                    {importing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Import Assets
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900 font-medium mb-2">
                      📊 Export Information
                    </p>
                    <p className="text-sm text-blue-700">
                      Export all {assetType.toLowerCase()} assets to a CSV file. You can open it in Excel, Google Sheets, or any spreadsheet application.
                    </p>
                  </div>

                  {error && (
                    <div className="flex items-start gap-3 text-red-700 text-sm bg-red-50 p-4 rounded-lg border border-red-200">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold mb-1">Export Error</p>
                        <p>{error}</p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="btn btn-primary w-full py-3 text-base"
                  >
                    {exporting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Download CSV File
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
