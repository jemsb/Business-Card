import { Contact } from './types';

/**
 * Builds a vCard string representation of a contact.
 */
export function getVcard(d: Partial<Contact>): string {
  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${d.name || ''}`,
    `TITLE:${d.title || ''}`,
    `ORG:${d.company || ''}`,
    `EMAIL:${d.email || ''}`,
    `TEL:${d.phone || ''}`,
    `URL:${d.web || ''}`,
    'END:VCARD'
  ].join('\n');
}

/**
 * Parses a vCard string into a Partial Contact object.
 */
export function parseVcard(text: string): Partial<Contact> {
  const data: Partial<Contact> = {
    name: '',
    title: '',
    company: '',
    email: '',
    phone: '',
    web: ''
  };

  if (!text) return data;

  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    const cleanLine = line.trim();
    if (!cleanLine) continue;

    const match = cleanLine.match(/^(FN|N|TITLE|ORG|EMAIL|TEL|URL)(;[^:]*)?:(.*)$/i);
    if (!match) continue;

    const key = match[1].toUpperCase();
    let value = match[3].trim();

    // Clean up semi-colons occasionally found in names/org fields
    if (key === 'FN' || key === 'N') {
      value = value.replace(/;/g, ' ').trim();
      // Only set name if not already set by FN (N offers fallback)
      if (key === 'FN' || !data.name) {
        data.name = value;
      }
    } else if (key === 'TITLE') {
      data.title = value;
    } else if (key === 'ORG') {
      data.company = value.replace(/;/g, ' ').trim();
    } else if (key === 'EMAIL') {
      data.email = value;
    } else if (key === 'TEL') {
      data.phone = value;
    } else if (key === 'URL') {
      data.web = value;
    }
  }

  return data;
}

/**
 * Tells if a HEX color is light or dark (for appropriate contrast text styling)
 */
export function isLightColor(hex: string): boolean {
  if (!hex || hex.length < 7) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return false;
  // Standard relative luminance calculations
  return (r * 299 + g * 587 + b * 114) / 1000 > 180;
}
