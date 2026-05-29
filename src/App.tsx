import React, { useState, useEffect } from 'react';
import {
  IdCard,
  Scan,
  Users,
  Settings,
  Mail,
  Phone,
  Globe,
  Award,
  Copy,
  Share2,
  Trash2,
  Search,
  Check,
  UserPlus,
  ChevronDown,
  ChevronUp,
  Battery,
  Wifi,
  Signal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Contact } from './types';
import { PALETTES } from './constants';
import { isLightColor, getVcard } from './utils';
import { CardView } from './components/CardView';
import { Scanner } from './components/Scanner';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'card' | 'scan' | 'contacts' | 'profile'>('card');

  // User Card details (stored in localStorage)
  const [profile, setProfile] = useState<Omit<Contact, 'id' | 'palIdx'>>(() => {
    const cached = localStorage.getItem('cardwallet_profile');
    if (cached) {
      try { return JSON.parse(cached); } catch { /* ignore */ }
    }
    return {
      name: 'Alex Morgan',
      title: 'Product Designer',
      company: 'Studio Works',
      email: 'alex@studioworks.co',
      phone: '+1 (415) 555-0100',
      web: 'studioworks.co'
    };
  });

  const [profilePalIdx, setProfilePalIdx] = useState<number>(() => {
    const cached = localStorage.getItem('cardwallet_profile_pallet');
    return cached ? parseInt(cached, 10) : 0;
  });

  // Stored Contacts in "Others"
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const cached = localStorage.getItem('cardwallet_contacts');
    if (cached) {
      try { return JSON.parse(cached); } catch { /* ignore */ }
    }
    // High-quality initial mock contacts
    return [
      {
        id: 1,
        name: 'Sarah Chen',
        title: 'Principal Architect',
        company: 'Innovate Lab',
        email: 'sarah@innovate.io',
        phone: '+1 (650) 555-4032',
        web: 'innovate.io',
        palIdx: 2 // Greenish
      },
      {
        id: 2,
        name: 'Marcus Gray',
        title: 'Director of Product',
        company: 'Apex Design Co',
        email: 'marcus@apexdesign.com',
        phone: '+1 (415) 555-9011',
        web: 'apexdesign.com',
        palIdx: 7 // Orange/Red
      }
    ];
  });

  // Accordion state in Others List
  const [expandedContactId, setExpandedContactId] = useState<number | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Scanner Results state
  const [scannedResult, setScannedResult] = useState<Partial<Contact> | null>(null);

  // Status/Toast messaging
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('cardwallet_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('cardwallet_profile_pallet', profilePalIdx.toString());
  }, [profilePalIdx]);

  useEffect(() => {
    localStorage.setItem('cardwallet_contacts', JSON.stringify(contacts));
  }, [contacts]);

  // Toast auto-clear helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Copy own vCard
  const copyOwnVcard = async () => {
    const vcard = getVcard({ ...profile, palIdx: profilePalIdx, id: 0 });
    try {
      await navigator.clipboard.writeText(vcard);
      triggerToast('vCard copied to clipboard!');
    } catch (err) {
      triggerToast('Failed to copy. Try sharing.');
    }
  };

  // Share own vCard link representation
  const shareOwnCard = () => {
    const subject = `Business Card of ${profile.name}`;
    const body = `Hi! Here are my contact details:\n\n${profile.name}\n${profile.title} at ${profile.company}\nPhone: ${profile.phone}\nEmail: ${profile.email}\nWebsite: ${profile.web}`;
    const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Attempt standard mail protocol, with nice clipboard copy fallback
    window.location.href = mailto;
    triggerToast('Opening mail client... Details copied to clipboard!');
    navigator.clipboard?.writeText(body).catch(() => {});
  };

  // Handle incoming scanner result
  const handleScannerResult = (parsed: Partial<Contact>) => {
    setScannedResult(parsed);
    triggerToast('QR decoded successfully!');
  };

  // Save parsed scanned contact to Local List
  const saveScannedContact = () => {
    if (!scannedResult) return;
    
    const newContact: Contact = {
      id: Date.now(),
      name: scannedResult.name || 'Anonymous',
      title: scannedResult.title || 'Professional',
      company: scannedResult.company || 'Company',
      email: scannedResult.email || '',
      phone: scannedResult.phone || '',
      web: scannedResult.web || '',
      palIdx: Math.floor(Math.random() * PALETTES.length) // Give them an awesome random theme
    };

    setContacts((prev) => [newContact, ...prev]);
    setScannedResult(null);
    triggerToast(`${newContact.name} saved under Others!`);
    setActiveTab('contacts');
    setExpandedContactId(newContact.id); // Expand the newly added contact
  };

  // Delete contact
  const handleDeleteContact = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const deleted = contacts.find(c => c.id === id);
    setContacts((prev) => prev.filter((c) => c.id !== id));
    if (expandedContactId === id) {
      setExpandedContactId(null);
    }
    if (deleted) {
      triggerToast(`Removed ${deleted.name}`);
    }
  };

  // Pre-fill profile fields in Inputs
  const handleProfileChange = (field: keyof typeof profile, val: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: val
    }));
  };

  // Filter contacts
  const filteredContacts = contacts.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.title || '').toLowerCase().includes(q) ||
      (c.company || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q)
    );
  });

  // Current formatted simulated time
  const currentSimulatedTime = '10:05'; // Elegant matching AM/PM aspect ratio standard

  const currentOwnPalette = PALETTES[profilePalIdx];



  const resetToDefaults = () => {
    localStorage.removeItem('cardwallet_profile');
    localStorage.removeItem('cardwallet_profile_pallet');
    localStorage.removeItem('cardwallet_contacts');
    
    // Set actual defaults
    setProfile({
      name: 'Alex Morgan',
      title: 'Product Designer',
      company: 'Studio Works',
      email: 'alex@studioworks.co',
      phone: '+1 (415) 555-0100',
      web: 'studioworks.co'
    });
    setProfilePalIdx(0);
    setContacts([
      {
        id: 1,
        name: 'Sarah Chen',
        title: 'Principal Architecture',
        company: 'Innovate Lab',
        email: 'sarah@innovate.io',
        phone: '+1 (650) 555-4032',
        web: 'innovate.io',
        palIdx: 2
      },
      {
        id: 2,
        name: 'Marcus Gray',
        title: 'Director of Product',
        company: 'Apex Design Co',
        email: 'marcus@apexdesign.com',
        phone: '+1 (415) 555-9011',
        web: 'apexdesign.com',
        palIdx: 7
      }
    ]);
    triggerToast('Cache rebuilt successfully!');
  };

  return (
    <div className="min-h-screen w-full bg-[#020617] text-slate-200 font-sans flex flex-col p-4 md:p-6 selection:bg-[#312e81]" style={{ backgroundColor: '#020617' }}>
      <div className="max-w-xl w-full mx-auto flex flex-col gap-4 py-2">
        


        {/* Central screen workspace application section */}
        <main className="bg-[#050a1d]/40 rounded-3xl border border-slate-800/80 p-5 md:p-6 backdrop-blur-md shadow-2xl relative">
          <AnimatePresence mode="wait">
            
            {/* TAB #1: My Card */}
            {activeTab === 'card' && (
              <motion.div
                key="tab-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
                className="max-w-md mx-auto space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 id="screen-heading-card" className="font-sans text-xl font-bold text-white tracking-tight">
                      My Card
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Your active digital badge and vCard QR.
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-sky-400 flex items-center justify-center font-bold text-sm text-white border border-slate-800">
                    {profile.name[0]}
                  </div>
                </div>

                <div className="perspective-1000">
                  <CardView contact={profile} palette={currentOwnPalette} showQr={true} />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={copyOwnVcard}
                    id="btn-copy-vcard"
                    className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl font-sans text-xs font-semibold tracking-wide border border-slate-800 bg-slate-900/60 hover:bg-slate-850 text-slate-200 shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    <Copy size={14} />
                    Copy vCard
                  </button>
                  <button
                    onClick={shareOwnCard}
                    id="btn-share-vcard"
                    className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl font-sans text-xs font-semibold tracking-wide border border-[#4338ca] bg-[#4f46e5] hover:bg-[#4338ca] text-white shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    <Share2 size={14} />
                    Share Card
                  </button>
                </div>
              </motion.div>
            )}

            {/* TAB #2: Scan Card */}
            {activeTab === 'scan' && (
              <motion.div
                key="tab-scan"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
                className="max-w-md mx-auto space-y-6"
              >
                <div>
                  <h2 id="screen-heading-scan" className="font-sans text-xl font-bold text-white tracking-tight">
                    Scan a Card
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Turn your camera toward any card QR code.
                  </p>
                </div>

                <Scanner onScanResult={handleScannerResult} />

                {scannedResult && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-4 bg-slate-900/90 rounded-2xl border border-indigo-500/30 relative"
                  >
                    <span className="absolute top-4 right-4 text-[9px] font-semibold tracking-wide text-indigo-400 px-2 py-0.5 rounded-full bg-indigo-500/15 uppercase">
                      Decoded
                    </span>

                    <h4 className="font-sans text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-2">
                      Detected Contact
                    </h4>

                    <div className="space-y-1 mb-3.5">
                      {scannedResult.name && (
                        <div className="text-[11px] text-slate-300">
                          <strong className="text-slate-500 select-text font-normal font-mono text-[10px]">FN:</strong> {scannedResult.name}
                        </div>
                      )}
                      {scannedResult.title && (
                        <div className="text-[11px] text-slate-300">
                          <strong className="text-slate-500 select-text font-normal font-mono text-[10px]">TITLE:</strong> {scannedResult.title}
                        </div>
                      )}
                      {scannedResult.company && (
                        <div className="text-[11px] text-slate-300">
                          <strong className="text-slate-500 select-text font-normal font-mono text-[10px]">ORG:</strong> {scannedResult.company}
                        </div>
                      )}
                      {scannedResult.email && (
                        <div className="text-[11px] text-slate-300">
                          <strong className="text-slate-500 select-text font-normal font-mono text-[10px]">EMAIL:</strong> {scannedResult.email}
                        </div>
                      )}
                      {scannedResult.phone && (
                        <div className="text-[11px] text-slate-300">
                          <strong className="text-slate-500 select-text font-normal font-mono text-[10px]">TEL:</strong> {scannedResult.phone}
                        </div>
                      )}
                      {scannedResult.web && (
                        <div className="text-[11px] text-slate-300">
                          <strong className="text-slate-500 select-text font-normal font-mono text-[10px]">URL:</strong> {scannedResult.web}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={saveScannedContact}
                      id="btn-save-scanned"
                      className="w-full py-2.5 px-4 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-sans text-xs font-semibold tracking-wide rounded-xl shadow transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer border border-[#4338ca]"
                    >
                      <UserPlus size={14} />
                      Save to Others
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* TAB #3: Others (Contact List) */}
            {activeTab === 'contacts' && (
              <motion.div
                key="tab-contacts"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
                className="max-w-xl mx-auto space-y-6"
              >
                <div>
                  <h2 id="screen-heading-others" className="font-sans text-xl font-bold text-white tracking-tight">
                    Others
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Saved cards of friends and business associates.
                  </p>
                </div>

                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-500" size={15} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white"
                    placeholder="Search contacts..."
                  />
                </div>

                {filteredContacts.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 space-y-3 bg-slate-900/30 border border-slate-900 rounded-2xl">
                    <Users size={32} className="mx-auto opacity-30 mb-0.5" />
                    <p className="text-xs font-medium">
                      {contacts.length === 0 ? 'No contacts yet.' : 'No matches found.'}
                    </p>
                    <p className="text-[10px] opacity-65 px-4 max-w-xs mx-auto">
                      {contacts.length === 0 ? 'Open "Scan" to grab some QR business cards.' : 'Try adjusting your query term.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredContacts.map((c) => {
                      const expanded = expandedContactId === c.id;
                      const initials = (c.name || 'C')
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase();

                      const pal = PALETTES[c.palIdx] || PALETTES[0];

                      return (
                        <div
                          key={c.id}
                          className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm transition hover:border-slate-700 flex flex-col h-fit"
                        >
                          <div
                            onClick={() => setExpandedContactId(expanded ? null : c.id)}
                            className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none active:bg-slate-850"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs"
                                style={{
                                  backgroundColor: `${pal.bg}22`,
                                  color: pal.bg === '#ffffff' ? '#ffffff' : pal.bg,
                                  border: `1px solid ${pal.bg}44`
                                }}
                              >
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-white truncate">
                                  {c.name}
                                </h4>
                                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                  {[c.title, c.company].filter(Boolean).join(' · ')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={(e) => handleDeleteContact(c.id, e)}
                                className="p-1 px-1.5 text-slate-500 hover:text-rose-400 rounded-md transition duration-150 cursor-pointer"
                                title="Remove Contact"
                              >
                                <Trash2 size={13} />
                              </button>
                              {expanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                            </div>
                          </div>

                          <div
                            className={`transition-all duration-300 ease-in-out ${
                              expanded ? 'max-h-[460px] opacity-100 border-t border-slate-800 p-4 bg-[#030613]/55' : 'max-h-0 opacity-0 pointer-events-none'
                            }`}
                          >
                            {expanded && (
                              <div className="space-y-4">
                                <CardView contact={c} palette={pal} showQr={true} />
                                
                                <div className="flex items-center justify-end gap-1.5 text-[10px] text-slate-400">
                                  <span>Actions:</span>
                                  <a
                                    href={`mailto:${c.email}`}
                                    className="p-1.5 px-3.5 border border-slate-850 bg-slate-950 rounded-lg hover:text-white transition font-semibold"
                                  >
                                    Email
                                  </a>
                                  {c.phone && (
                                    <a
                                      href={`tel:${c.phone}`}
                                      className="p-1.5 px-3.5 border border-slate-850 bg-slate-950 rounded-lg hover:text-white transition font-semibold"
                                    >
                                      Call
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB #4: Profile */}
            {activeTab === 'profile' && (
              <motion.div
                key="tab-profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
                className="max-w-2xl mx-auto space-y-6"
              >
                <div>
                  <h2 id="screen-heading-profile" className="font-sans text-xl font-bold text-white tracking-tight">
                    Profile
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure your business card and identity theme.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Column 1: Details */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Your Details
                    </h3>

                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-3.5">
                      <div className="space-y-1">
                        <label htmlFor="f-name" className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">
                          Full Name
                        </label>
                        <input
                          id="f-name"
                          type="text"
                          value={profile.name}
                          onChange={(e) => handleProfileChange('name', e.target.value)}
                          className="w-full text-xs p-2.5 bg-slate-950 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white font-sans"
                          placeholder="E.g., Alex Morgan"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="f-title" className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">
                          Job Title
                        </label>
                        <input
                          id="f-title"
                          type="text"
                          value={profile.title}
                          onChange={(e) => handleProfileChange('title', e.target.value)}
                          className="w-full text-xs p-2.5 bg-slate-950 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white font-sans"
                          placeholder="E.g., Executive Producer"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="f-company" className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">
                          Company
                        </label>
                        <input
                          id="f-company"
                          type="text"
                          value={profile.company}
                          onChange={(e) => handleProfileChange('company', e.target.value)}
                          className="w-full text-xs p-2.5 bg-slate-950 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white font-sans"
                          placeholder="E.g., Studio Works"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="f-email" className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">
                          Email Address
                        </label>
                        <input
                          id="f-email"
                          type="email"
                          value={profile.email}
                          onChange={(e) => handleProfileChange('email', e.target.value)}
                          className="w-full text-xs p-2.5 bg-slate-950 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white font-sans"
                          placeholder="E.g., alex@domain.com"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="f-phone" className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">
                          Phone Number
                        </label>
                        <input
                          id="f-phone"
                          type="tel"
                          value={profile.phone}
                          onChange={(e) => handleProfileChange('phone', e.target.value)}
                          className="w-full text-xs p-2.5 bg-slate-950 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white font-sans"
                          placeholder="E.g., +1 (415) 555-1234"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="f-web" className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">
                          Website Link
                        </label>
                        <input
                          id="f-web"
                          type="text"
                          value={profile.web}
                          onChange={(e) => handleProfileChange('web', e.target.value)}
                          className="w-full text-xs p-2.5 bg-slate-950 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white font-sans"
                          placeholder="E.g., studioworks.co"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Theme and actions */}
                  <div className="space-y-5">
                    <div className="space-y-3.5 font-sans">
                      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Card Color Accent
                      </h3>
                      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4">
                        <div className="flex gap-2.5 flex-wrap">
                          {PALETTES.map((pal, idx) => {
                            const isMainActive = profilePalIdx === idx;
                            const isLight = isLightColor(pal.bg);
                            return (
                              <div
                                key={idx}
                                onClick={() => setProfilePalIdx(idx)}
                                className="w-8 h-8 rounded-full cursor-pointer relative flex items-center justify-center border transition-all duration-150 shadow-sm active:scale-90"
                                style={{
                                  backgroundColor: pal.bg,
                                  borderColor: isMainActive
                                    ? '#4f46e5'
                                    : isLight
                                    ? '#334155'
                                    : 'transparent',
                                  boxShadow: isMainActive ? '0 0 0 2px rgba(99, 102, 241, 0.4)' : 'none'
                                }}
                              >
                                {isMainActive && (
                                  <Check
                                    size={13}
                                    style={{
                                      color: pal.text
                                    }}
                                    className="stroke-[3.5]"
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <button
                        onClick={() => setActiveTab('card')}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#4f46e5] text-white border border-[#4338ca] hover:bg-[#4338ca] font-sans text-xs font-semibold tracking-wide rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                      >
                        <IdCard size={14} />
                        View Updated Card
                      </button>
                      <button
                        onClick={resetToDefaults}
                        className="w-full py-3 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:text-slate-300 text-slate-400 text-xs font-semibold rounded-xl transition duration-150 cursor-pointer"
                      >
                        Reset Data to Default
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer Navigation Tabs */}
        <footer className="flex justify-center pt-2 mt-1">
          <nav className="flex items-center bg-[#050a1d]/85 p-1.5 rounded-2xl border border-slate-800/80 flex-wrap justify-center shadow-xl">
            <button
              onClick={() => {
                setActiveTab('card');
                setScannedResult(null);
              }}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'card' ? 'bg-[#4f46e5] text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <IdCard size={14} />
              <span>My Card</span>
            </button>
            <button
              onClick={() => setActiveTab('scan')}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'scan' ? 'bg-[#4f46e5] text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Scan size={14} />
              <span>Scan</span>
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer relative ${
                activeTab === 'contacts' ? 'bg-[#4f46e5] text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users size={14} />
              <span>Others</span>
              {contacts.length > 0 && (
                <span className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full text-[9px] font-extrabold bg-[#4f46e5] border border-slate-900 text-white leading-none ml-1">
                  {contacts.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'profile' ? 'bg-[#4f46e5] text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Settings size={14} />
              <span>Profile</span>
            </button>
          </nav>
        </footer>
      </div>

      {/* Global Toast Notification Popup layer */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/95 text-slate-200 text-xs font-sans font-medium px-4 py-2.5 rounded-full z-50 flex items-center gap-2 shadow-xl whitespace-nowrap border border-slate-800"
          >
            <Check size={13} className="text-indigo-400 font-bold" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
