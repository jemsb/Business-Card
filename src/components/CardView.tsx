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
  const [qrWidth, setQrWidth] = useState(240);

  useEffect(() => {
    const handleResize = () => {
      // Since the QR Code is positioned below the contact list, it has more horizontal room.
      // Scaling it larger creates a modern badge-style digital business card.
      if (window.innerWidth < 380) {
        setQrWidth(190);
      } else if (window.innerWidth < 430) {
        setQrWidth(230);
      } else {
        setQrWidth(270);
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
      className="w-full rounded-2xl overflow-hidden shadow-lg transition-all duration-300 transform border border-transparent min-h-[300px]"
      style={{
        backgroundColor: palette.bg,
        color: palette.text,
      }}
    >
      {/* Container holding details at the top, and QR code centered below */}
      <div className="p-5 sm:p-6 flex flex-col items-center gap-5">
        {/* Top: Contact details (full width) */}
        <div className="w-full flex flex-col gap-3.5 min-w-0 text-left">
          <div className="border-b border-white/10 pb-3">
            <h3 className="font-sans text-lg sm:text-2xl font-bold tracking-tight text-current select-all truncate">
              {contact.name || 'Anonymous'}
            </h3>
            <p className="font-sans text-xs sm:text-sm font-medium opacity-85 mt-1 tracking-wide select-all truncate">
              {contact.title || 'No Title'}
            </p>
          </div>

          <div className="space-y-2 pt-1">
            {contact.company && (
              <p className="font-sans text-xs sm:text-sm font-semibold uppercase tracking-wider opacity-90 select-all flex items-center gap-2 truncate">
                <Award size={14} className="opacity-80 flex-shrink-0" />
                <span>{contact.company}</span>
              </p>
            )}

            {contact.email && (
              <div className="flex items-center gap-2 text-current text-xs sm:text-sm select-all min-w-0">
                <Mail size={13} className="opacity-80 flex-shrink-0" />
                <span className="truncate">{contact.email}</span>
              </div>
            )}

            {contact.phone && (
              <div className="flex items-center gap-2 text-current text-xs sm:text-sm select-all min-w-0">
                <Phone size={13} className="opacity-80 flex-shrink-0" />
                <span className="truncate">{contact.phone}</span>
              </div>
            )}

            {contact.web && (
              <div className="flex items-center gap-2 text-current text-xs sm:text-sm select-all min-w-0">
                <Globe size={13} className="opacity-80 flex-shrink-0" />
                <span className="truncate">{contact.web}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom: QR Code */}
        {showQr && (
          <div className="flex-shrink-0 flex flex-col items-center justify-center w-full mt-1">
            <div className="bg-white/10 p-2 sm:p-2.5 rounded-2xl shadow-inner border border-white/10 transition-all duration-350">
              <QrCodeCanvas
                text={vcardText}
                width={qrWidth}
                fgColor={palette.text}
                bgColor={palette.bg}
              />
            </div>
            <p className="text-[10px] sm:text-xs opacity-60 font-sans tracking-wide mt-2 font-medium">
              Scan dynamic badge
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
