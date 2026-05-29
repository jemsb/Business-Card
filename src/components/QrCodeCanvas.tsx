import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QrCodeCanvasProps {
  id?: string;
  text: string;
  width?: number;
  fgColor?: string;
  bgColor?: string;
  className?: string;
}

export function QrCodeCanvas({
  id,
  text,
  width = 80,
  fgColor = '#ffffff',
  bgColor = '#1a1a1a',
  className = ''
}: QrCodeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !text) return;

    QRCode.toCanvas(
      canvasRef.current,
      text,
      {
        width: width,
        margin: 1,
        color: {
          dark: fgColor,
          light: bgColor
        },
        errorCorrectionLevel: 'M'
      },
      (error) => {
        if (error) {
          console.error('Failed to render QR Code:', error);
        }
      }
    );
  }, [text, width, fgColor, bgColor]);

  return (
    <canvas
      id={id}
      ref={canvasRef}
      style={{ width: `${width}px`, height: `${width}px` }}
      className={`rounded-lg max-w-full ${className}`}
    />
  );
}
