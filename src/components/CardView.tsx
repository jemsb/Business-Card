import { useState, useEffect } from 'react';
import { Mail, Phone, Globe, Award } from 'lucide-react';
import { Contact, Palette } from '../types';
import { QrCodeCanvas } from './QrCodeCanvas';
import { getVcard } from '../utils';

interface CardViewProps {
  contact: Partial<Contact>;
  palette: Palette;
  showQr?: boolean;
}

export function CardView({ contact, palette, showQr = true }: CardViewProps) {
  const vcardText = getVcard(contact);
  const [qrWidth, setQrWidth] = useState(130);

  useEffect(() => {
    const handleResize = () => {
      // Dynamic adapt QR Code width matching viewport width.
      // On narrow android screens (< 380px or < 430px), we scale compact QR dimensions
      // so contact text labels have maximum space to stretch.
      if (window.innerWidth < 380) {
        setQrWidth(95);
      } else if (window.innerWidth < 430) {
        setQrWidth(120);
      } else {
        setQrWidth(160);
      }
    };

    handleResize(); // trigger on initial load
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      className="w-full rounded-2xl overflow-hidden shadow-lg transition-all duration-300 transform border border-transparent min-h-[190px]"
      style={{
        backgroundColor: palette.bg,
        color: palette.text,
      }}
    >
      {/* Container holding details and QR side-by-side */}
      <div className="p-6 flex flex-row items-center justify-between gap-5 sm:gap-6">
        {/* Left column: Contact details */}
        <div className="flex-1 flex flex-col justify-between gap-4 min-w-0">
          <div>
            <h3 className="font-sans text-lg sm:text-xl font-bold tracking-tight text-current select-all truncate">
              {contact.name || 'Anonymous'}
            </h3>
            <p className="font-sans text-[11px] sm:text-xs opacity-75 mt-0.5 tracking-wide select-all truncate">
              {contact.title || 'No Title'}
            </p>
          </div>

          <div className="space-y-1.5">
            {contact.company && (
              <p className="font-sans text-[10px] sm:text-xs font-semibold uppercase tracking-wider opacity-90 select-all mb-1 flex items-center gap-1.5 truncate">
                <Award size={13} className="opacity-80 flex-shrink-0" />
                <span>{contact.company}</span>
              </p>
            )}

            {contact.email && (
              <div className="flex items-center gap-1.5 sm:gap-2 text-current text-[11px] sm:text-xs select-all min-w-0">
                <Mail size={12} className="opacity-80 flex-shrink-0" />
                <span className="truncate">{contact.email}</span>
              </div>
            )}

            {contact.phone && (
              <div className="flex items-center gap-1.5 sm:gap-2 text-current text-[11px] sm:text-xs select-all min-w-0">
                <Phone size={12} className="opacity-80 flex-shrink-0" />
                <span className="truncate">{contact.phone}</span>
              </div>
            )}

            {contact.web && (
              <div className="flex items-center gap-1.5 sm:gap-2 text-current text-[11px] sm:text-xs select-all min-w-0">
                <Globe size={12} className="opacity-80 flex-shrink-0" />
                <span className="truncate">{contact.web}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right column: QR Code */}
        {showQr && (
          <div className="flex-shrink-0 flex items-center justify-center">
            <div className="bg-white/5 p-1.5 rounded-xl shadow-inner transition-all duration-350">
              <QrCodeCanvas
                text={vcardText}
                width={qrWidth}
                fgColor={palette.text}
                bgColor={palette.bg}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
