'use client';

import { QRCodeSVG } from 'qrcode.react';

interface QRCodeProps {
  asset: {
    id: string;
    assetTag: string;
    assetName: string;
    type: string;
    purchaseDate?: string;
    assignedTo?: string;
    location?: string;
    condition?: string;
    status?: string;
    company?: string;
    [key: string]: any;
  };
  size?: number;
  showDownload?: boolean;
}

export default function QRCode({ asset, size = 200, showDownload = true }: QRCodeProps) {
  // Create URL that points to the asset's QR detail page
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  const assetUrl = `${BASE_URL}/qr/${asset.id}`;

  const handleDownload = () => {
    const svgElement = document.querySelector('.qr-code-container svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      const scale = 3;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      if (ctx) {
        ctx.scale(scale, scale);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      }
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `qr-${asset.assetTag}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  };

  const handlePrint = () => {
    const svgElement = document.querySelector('.qr-code-container svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${asset.assetTag}</title>
          <style>
            body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: Arial, sans-serif; }
            .container { text-align: center; }
            .asset-tag { font-size: 18px; margin-bottom: 10px; font-weight: bold; }
            .asset-name { font-size: 14px; color: #666; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="asset-tag">${asset.assetTag}</div>
            <div class="asset-name">${asset.assetName}</div>
            ${svgData}
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-white p-4 border-2 border-slate-200 rounded-lg qr-code-container">
        <QRCodeSVG
          value={assetUrl}
          size={size}
          level="M"
          includeMargin={true}
        />
      </div>
      <div className="text-center">
        <p className="font-mono text-sm font-bold text-slate-900">{asset.assetTag}</p>
        <p className="text-xs text-slate-600 mt-1">{asset.assetName}</p>
        <p className="text-[10px] text-slate-400 mt-1">Scan to view asset details (password protected)</p>
      </div>
      {showDownload && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="btn btn-secondary btn-sm flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="btn btn-secondary btn-sm flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
        </div>
      )}
    </div>
  );
}
