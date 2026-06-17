'use client';

import { useRef, useCallback } from 'react';
import Barcode from 'react-barcode';

interface BarcodeProps {
  value: string;
  width?: number;
  height?: number;
  fontSize?: number;
  showValue?: boolean;
  format?: 'CODE128' | 'EAN13' | 'CODE39';
}

export default function BarcodeComponent({
  value,
  width = 2,
  height = 60,
  fontSize = 12,
  showValue = true,
  format = 'CODE128',
}: BarcodeProps) {
  const barcodeRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(() => {
    if (!barcodeRef.current) return;

    const svgElement = barcodeRef.current.querySelector('svg');
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
      downloadLink.download = `barcode-${value}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  }, [value]);

  const handlePrint = useCallback(() => {
    if (!barcodeRef.current) return;

    const svgElement = barcodeRef.current.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Barcode - ${value}</title>
          <style>
            body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
            .container { text-align: center; }
            .asset-name { font-family: Arial, sans-serif; font-size: 16px; margin-bottom: 10px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="asset-name">${value}</div>
            ${svgData}
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }, [value]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={barcodeRef}
        className="bg-white p-4 rounded-lg inline-block border border-gray-200"
      >
        <Barcode
          value={value}
          width={width}
          height={height}
          fontSize={fontSize}
          displayValue={showValue}
          format={format}
          margin={10}
          background="#ffffff"
          lineColor="#000000"
        />
      </div>
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
    </div>
  );
}
