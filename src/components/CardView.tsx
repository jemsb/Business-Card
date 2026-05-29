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

  return (
    <div
      className="w-full rounded-2xl overflow-hidden shadow-lg transition-all duration-300 transform border border-transparent flex flex-col min-h-[190px]"
      style={{
        backgroundColor: palette.bg,
        color: palette.text,
      }}
    >
      {/* Front Design Aspect */}
      <div className="p-6 flex-1 flex flex-col justify-between gap-6">
        <div>
          <h3 className="font-sans text-xl font-bold tracking-tight text-current select-all">
            {contact.name || 'Anonymous'}
          </h3>
          <p className="font-sans text-xs opacity-75 mt-0.5 tracking-wide select-all">
            {contact.title || 'No Title'}
          </p>
        </div>

        <div className="space-y-2">
          {contact.company && (
            <p className="font-sans text-xs font-semibold uppercase tracking-wider opacity-90 select-all mb-1.5 flex items-center gap-1.5">
              <Award size={13} className="opacity-80" />
              {contact.company}
            </p>
          )}

          {contact.email && (
            <div className="flex items-center gap-2 text-current text-xs select-all">
              <Mail size={12} className="opacity-80 flex-shrink-0" />
              <span className="truncate">{contact.email}</span>
            </div>
          )}

          {contact.phone && (
            <div className="flex items-center gap-2 text-current text-xs select-all">
              <Phone size={12} className="opacity-80 flex-shrink-0" />
              <span className="truncate">{contact.phone}</span>
            </div>
          )}

          {contact.web && (
            <div className="flex items-center gap-2 text-current text-xs select-all">
              <Globe size={12} className="opacity-80 flex-shrink-0" />
              <span className="truncate">{contact.web}</span>
            </div>
          )}
        </div>
      </div>

      {/* QR Code Section with subtle Top Border */}
      {showQr && (
        <div
          className="flex items-center justify-between px-6 py-4 transition-all duration-300"
          style={{
            borderTop: `1px solid ${palette.div}`,
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
          }}
        >
          <div className="text-[10px] leading-tight opacity-75 font-sans font-medium">
            Scan to save
            <br />
            this contact
          </div>
          <div className="bg-white/5 p-1 rounded-lg">
            <QrCodeCanvas
              text={vcardText}
              width={76}
              fgColor={palette.text}
              bgColor={palette.bg}
            />
          </div>
        </div>
      )}
    </div>
  );
}
