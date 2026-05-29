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

  // Pre-calculate stats metrics for status monitor dashboard panels
  const completedFields = [profile.name, profile.title, profile.company, profile.email, profile.phone, profile.web].filter(Boolean).length;
  const completenessPercent = Math.round((completedFields / 6) * 100);
  const contactsPercent = Math.min(Math.round((contacts.length / 8) * 100), 100);
  const palettePercent = Math.round(((profilePalIdx + 1) / PALETTES.length) * 100);

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
    <div className="min-h-screen w-full bg-[#020617] text-slate-200 font-sans flex items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-12 overflow-y-auto selection:bg-[#312e81]" style={{ backgroundColor: '#020617' }}>
      <div className="flex flex-col lg:flex-row w-full max-w-5xl items-center justify-between gap-10 xl:gap-14 py-6">
        
        {/* LEFT PANEL: Specifications Grid Design Element */}
        <div className="w-full lg:w-[32%] space-y-7 flex-shrink-0 text-left">
          <div className="space-y-1.5">
            <p className="text-sky-400 font-mono text-xs uppercase tracking-widest font-semibold">Component Specs</p>
            <h2 id="left-title-header" className="text-3xl font-extrabold text-white tracking-tight">System Dashboard</h2>
            <p className="text-slate-400 text-xs leading-relaxed">
              A premium business card utility designed with Material You principles, emphasizing custom vector nodes, device storage persistence, and geometric alignment.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/40 p-3.5 border border-slate-900/80 rounded-2xl">
              <p className="text-slate-500 text-[10px] uppercase font-mono font-bold tracking-wider mb-1">Grid System</p>
              <p className="text-white text-xs font-semibold">Dynamic Flex</p>
            </div>
            <div className="bg-slate-900/40 p-3.5 border border-slate-900/80 rounded-2xl">
              <p className="text-slate-500 text-[10px] uppercase font-mono font-bold tracking-wider mb-1">Corner Radius</p>
              <p className="text-white text-xs font-semibold">28px / 12px</p>
            </div>
            <div className="bg-slate-900/40 p-3.5 border border-slate-900/80 rounded-2xl">
              <p className="text-slate-500 text-[10px] uppercase font-mono font-bold tracking-wider mb-1">Typeface</p>
              <p className="text-white text-xs font-semibold">Outfit Sans</p>
            </div>
            <div className="bg-slate-900/40 p-3.5 border border-slate-900/80 rounded-2xl">
              <p className="text-slate-500 text-[10px] uppercase font-mono font-bold tracking-wider mb-1">Palette Nodes</p>
              <p className="text-white text-xs font-semibold">{PALETTES.length} Nodes</p>
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-800">
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-indigo-500 shadow-lg animate-pulse" style={{ animationDuration: '3s' }}></div>
              <div className="w-7 h-7 rounded-full bg-sky-400 shadow-lg animate-pulse" style={{ animationDuration: '4s' }}></div>
              <div className="w-7 h-7 rounded-full bg-slate-100 shadow-lg"></div>
              <div className="w-7 h-7 rounded-full bg-slate-800 shadow-lg border border-slate-700"></div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: The simulated phone app wrapped inside dark theme */}
        <div className="relative w-full max-w-[340px] h-[670px] bg-[#050a1d]/60 rounded-[3rem] border-[8px] border-slate-900 shadow-[0_0_60px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col transition-all duration-300 ring-1 ring-slate-800 flex-shrink-0">
          
          {/* Top Camera Punch-Hole cutout */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-24 h-3.5 bg-slate-900 rounded-full z-50 pointer-events-none" />

          {/* Dynamic Simulated Android Status Bar */}
          <div className="px-6 pt-3 pb-2 flex items-center justify-between text-slate-300 select-none z-40 bg-[#060b1e]/85 backdrop-blur-md sticky top-0">
            <span className="text-[11px] font-semibold tracking-tight">10:05</span>
            <div className="flex items-center gap-1.5 opacity-80">
              <Signal size={11} className="stroke-[2.5]" />
              <Wifi size={11} className="stroke-[2.5]" />
              <div className="w-3.5 h-2 border border-slate-400 rounded-[3px] relative flex p-[1px]">
                <div className="h-full w-[80%] bg-slate-200 rounded-[1px]" />
                <div className="absolute right-[-2.5px] top-[1.5px] w-[1px] h-[3px] bg-slate-400 rounded-r-sm" />
              </div>
            </div>
          </div>

          {/* Central screen application scrollable viewport area */}
          <div className="flex-1 overflow-y-auto px-5 pb-20 pt-2 select-none bg-[#050a1d] text-slate-200 custom-scrollbar">
            
            <AnimatePresence mode="wait">
              {/* TAB #1: My Card */}
              {activeTab === 'card' && (
                <motion.div
                  key="tab-card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 id="screen-heading-card" className="font-sans text-lg font-bold text-white tracking-tight">
                        My Card
                      </h1>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Your active digital badge and vCard QR.
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-505 to-sky-400 flex items-center justify-center font-bold text-xs text-white border border-slate-800">
                      {profile.name[0]}
                    </div>
                  </div>

                  <div className="perspective-1000">
                    <CardView contact={profile} palette={currentOwnPalette} showQr={true} />
                  </div>

                  {/* Handheld Actions Row */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      onClick={copyOwnVcard}
                      id="btn-copy-vcard"
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-sans text-xs font-semibold tracking-wide border border-slate-800 bg-slate-900/60 hover:bg-slate-850 text-slate-200 shadow-sm transition active:scale-95 cursor-pointer"
                    >
                      <Copy size={13} />
                      Copy vCard
                    </button>
                    <button
                      onClick={shareOwnCard}
                      id="btn-share-vcard"
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-sans text-xs font-semibold tracking-wide border border-[#4338ca] bg-[#4f46e5] hover:bg-[#4338ca] text-white shadow-sm transition active:scale-95 cursor-pointer"
                    >
                      <Share2 size={13} />
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
                  className="space-y-5"
                >
                  <div>
                    <h1 id="screen-heading-scan" className="font-sans text-lg font-bold text-white tracking-tight">
                      Scan a Card
                    </h1>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Turn your camera toward any card QR code.
                    </p>
                  </div>

                  {/* Scanner Interface Block */}
                  <Scanner onScanResult={handleScannerResult} />

                  {/* Scanned Card Results Preview popin (if detected but not saved) */}
                  {scannedResult && (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-3.5 bg-slate-900/90 rounded-2xl border border-indigo-500/30 relative"
                    >
                      <span className="absolute top-3 right-3 text-[9px] font-semibold tracking-wide text-indigo-400 px-2 py-0.5 rounded-full bg-indigo-500/15 uppercase">
                        Decoded
                      </span>

                      <h4 className="font-sans text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-2">
                        Detected Contact
                      </h4>

                      {/* Extracted fields list */}
                      <div className="space-y-1 mb-3.5">
                        {scannedResult.name && (
                          <div className="text-[11px] text-slate-350">
                            <strong className="text-slate-500 select-text font-normal font-mono text-[10px]">FN:</strong> {scannedResult.name}
                          </div>
                        )}
                        {scannedResult.title && (
                          <div className="text-[11px] text-slate-350">
                            <strong className="text-slate-500 select-text font-normal font-mono text-[10px]">TITLE:</strong> {scannedResult.title}
                          </div>
                        )}
                        {scannedResult.company && (
                          <div className="text-[11px] text-slate-350">
                            <strong className="text-slate-500 select-text font-normal font-mono text-[10px]">ORG:</strong> {scannedResult.company}
                          </div>
                        )}
                        {scannedResult.email && (
                          <div className="text-[11px] text-slate-350">
                            <strong className="text-slate-500 select-text font-normal font-mono text-[10px]">EMAIL:</strong> {scannedResult.email}
                          </div>
                        )}
                        {scannedResult.phone && (
                          <div className="text-[11px] text-slate-350">
                            <strong className="text-slate-500 select-text font-normal font-mono text-[10px]">TEL:</strong> {scannedResult.phone}
                          </div>
                        )}
                        {scannedResult.web && (
                          <div className="text-[11px] text-slate-350">
                            <strong className="text-slate-500 select-text font-normal font-mono text-[10px]">URL:</strong> {scannedResult.web}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={saveScannedContact}
                        id="btn-save-scanned"
                        className="w-full py-2 px-3 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-sans text-xs font-semibold tracking-wide rounded-xl shadow transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer border border-[#4338ca]"
                      >
                        <UserPlus size={13} />
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
                  className="space-y-5"
                >
                  <div>
                    <h1 id="screen-heading-others" className="font-sans text-lg font-bold text-white tracking-tight">
                      Others
                    </h1>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Saved cards of friends and business associates.
                    </p>
                  </div>

                  {/* Search Bar wrapper */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-505" size={14} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white"
                      placeholder="Search contacts..."
                    />
                  </div>

                  {/* Render Expandable list */}
                  {filteredContacts.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 space-y-2 bg-slate-900/30 border border-slate-900 rounded-2xl">
                      <Users size={28} className="mx-auto opacity-30 mb-0.5" />
                      <p className="text-xs font-medium">
                        {contacts.length === 0 ? 'No contacts yet.' : 'No matches found.'}
                      </p>
                      <p className="text-[9px] opacity-65 px-4">
                        {contacts.length === 0 ? 'Open "Scan" to grab some QR business cards.' : 'Try adjusting your query term.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
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
                            className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm transition hover:border-slate-700"
                          >
                            {/* Accordion Header row */}
                            <div
                              onClick={() => setExpandedContactId(expanded ? null : c.id)}
                              className="p-3 flex items-center justify-between gap-3 cursor-pointer select-none active:bg-slate-850"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px]"
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
                                {/* Trigger actions */}
                                <button
                                  onClick={(e) => handleDeleteContact(c.id, e)}
                                  className="p-1 px-1.5 text-slate-500 hover:text-rose-450 rounded-md transition duration-150 cursor-pointer"
                                  title="Remove Contact"
                                >
                                  <Trash2 size={12} />
                                </button>
                                {expanded ? <ChevronUp size={13} className="text-slate-400" /> : <ChevronDown size={13} className="text-slate-400" />}
                              </div>
                            </div>

                            {/* Accordion Expandable body with actual badge block preview */}
                            <div
                              className={`transition-all duration-300 ease-in-out ${
                                expanded ? 'max-h-[460px] opacity-100 border-t border-slate-800 p-3.5 bg-[#030613]/55' : 'max-h-0 opacity-0 pointer-events-none'
                              }`}
                            >
                              {expanded && (
                                <div className="space-y-3.5">
                                  <CardView contact={c} palette={pal} showQr={true} />
                                  
                                  {/* Quick interactions */}
                                  <div className="flex items-center justify-end gap-1.5 text-[10px] text-slate-400">
                                    <span>Actions:</span>
                                    <a
                                      href={`mailto:${c.email}`}
                                      className="p-1 px-2 border border-slate-800 bg-slate-900 rounded-lg hover:text-white transition"
                                    >
                                      Email
                                    </a>
                                    {c.phone && (
                                      <a
                                        href={`tel:${c.phone}`}
                                        className="p-1 px-2 border border-slate-800 bg-slate-900 rounded-lg hover:text-white transition"
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
                  className="space-y-5"
                >
                  <div>
                    <h1 id="screen-heading-profile" className="font-sans text-lg font-bold text-white tracking-tight">
                      Profile
                    </h1>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Configure your business card and identity theme.
                    </p>
                  </div>

                  <div className="space-y-3.5">
                    <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Your Details
                    </h3>

                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-3.5 space-y-3">
                      {/* Full Name input */}
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

                      {/* Job Title input */}
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

                      {/* Company input */}
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

                      {/* Email input */}
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

                      {/* Phone input */}
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

                      {/* Website input */}
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

                  {/* Theme Selector Palette Swatches */}
                  <div className="space-y-3.5">
                    <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Card Color Accent
                    </h3>
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-3.5">
                      <div className="flex gap-2.5 flex-wrap">
                        {PALETTES.map((pal, idx) => {
                          const isMainActive = profilePalIdx === idx;
                          const isLight = isLightColor(pal.bg);
                          return (
                            <div
                              key={idx}
                              onClick={() => setProfilePalIdx(idx)}
                              className="w-7 h-7 rounded-full cursor-pointer relative flex items-center justify-center border transition-all duration-150 shadow-sm active:scale-90"
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

                  {/* Primary Card View Pivot CTA */}
                  <button
                    onClick={() => setActiveTab('card')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-[#4f46e5] text-white border border-[#4338ca] hover:bg-[#4338ca] font-sans text-xs font-semibold tracking-wide rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <IdCard size={14} />
                    View Updated Card
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Global Toast Popup layout notification overlay */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: 50, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, y: 20, x: '-50%' }}
                className="absolute bottom-18 left-1/2 -translate-x-1/2 bg-slate-900/90 dark:bg-slate-50/95 text-white dark:text-slate-900 text-[11px] font-sans font-medium px-3.5 py-2.5 rounded-full z-50 flex items-center gap-1.5 shadow-lg whitespace-nowrap backdrop-blur-sm pointer-events-none"
              >
                <Check size={12} className="text-indigo-400 dark:text-indigo-600 font-bold" />
                <span>{toastMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Simulated Android Bottom Tab Bar Navigation system */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#040816]/95 border-t border-slate-900 flex items-center justify-around px-2 z-40 backdrop-blur-md select-none">
            <button
              onClick={() => {
                setActiveTab('card');
                setScannedResult(null); // Reset scanned cache if they hop away
              }}
              id="bn-card"
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 max-w-[70px] bg-transparent border-none outline-none transition duration-150 cursor-pointer ${
                activeTab === 'card' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              <IdCard size={18} className={activeTab === 'card' ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
              <span className="text-[9px] font-bold tracking-wide uppercase">Card</span>
              {activeTab === 'card' && (
                <motion.span layoutId="bnav-dot" className="w-1 h-1 rounded-full bg-indigo-400 mt-0.5" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('scan')}
              id="bn-scan"
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 max-w-[70px] bg-transparent border-none outline-none transition duration-150 cursor-pointer ${
                activeTab === 'scan' ? 'text-indigo-400 font-bold' : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              <Scan size={18} className={activeTab === 'scan' ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
              <span className="text-[9px] font-bold tracking-wide uppercase">Scan</span>
              {activeTab === 'scan' && (
                <motion.span layoutId="bnav-dot" className="w-1 h-1 rounded-full bg-indigo-400 mt-0.5" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('contacts')}
              id="bn-contacts"
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 max-w-[70px] bg-transparent border-none outline-none transition duration-150 cursor-pointer relative ${
                activeTab === 'contacts' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              <Users size={18} className={activeTab === 'contacts' ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
              <span className="text-[9px] font-bold tracking-wide uppercase font-sans">Others</span>
              
              {/* Contacts Count Badge indicator layout */}
              {contacts.length > 0 && (
                <span className="absolute -top-1 right-2 inline-flex items-center justify-center px-1.5 py-0.5 text-[8px] font-extrabold font-mono bg-[#4f46e5]/80 text-white rounded-full leading-none shadow-sm animate-pulse min-w-[16px]">
                  {contacts.length}
                </span>
              )}
              {activeTab === 'contacts' && (
                <motion.span layoutId="bnav-dot" className="w-1 h-1 rounded-full bg-indigo-400 mt-0.5" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              id="bn-profile"
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 max-w-[70px] bg-transparent border-none outline-none transition duration-150 cursor-pointer ${
                activeTab === 'profile' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              <Settings size={18} className={activeTab === 'profile' ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
              <span className="text-[9px] font-bold tracking-wide uppercase">Profile</span>
              {activeTab === 'profile' && (
                <motion.span layoutId="bnav-dot" className="w-1 h-1 rounded-full bg-indigo-400 mt-0.5" />
              )}
            </button>
          </div>

          {/* Soft virtual gesture/home indicator bar at bottom of mobile frame */}
          <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-slate-800 rounded-full z-50 pointer-events-none" />

        </div>

        {/* RIGHT PANEL: Status Monitor & Rebuild Cache dashboard elements */}
        <div className="w-full lg:w-[32%] flex flex-col items-start lg:items-end lg:text-right space-y-12">
          
          <div className="space-y-4 w-full">
            <p className="text-sky-450 font-mono text-xs uppercase tracking-widest font-semibold text-sky-400">Status Monitor</p>
            <div className="space-y-6">
              
              {/* PROGRESS BAR 1: Profile Completeness */}
              <div className="space-y-1 rounded-xl">
                <div className="flex justify-between lg:justify-end gap-3 text-xs">
                  <span className="text-slate-400">Profile Completeness</span>
                  <span className="text-white font-bold">{completenessPercent}%</span>
                </div>
                <div className="w-full lg:w-48 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${completenessPercent}%` }} />
                </div>
              </div>

              {/* PROGRESS BAR 2: Contacts Saved */}
              <div className="space-y-1 rounded-xl">
                <div className="flex justify-between lg:justify-end gap-3 text-xs">
                  <span className="text-slate-400">Wallet Load</span>
                  <span className="text-white font-bold">{contactsPercent}%</span>
                </div>
                <div className="w-full lg:w-48 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-400 rounded-full transition-all duration-300" style={{ width: `${contactsPercent}%` }} />
                </div>
              </div>

              {/* PROGRESS BAR 3: Gradient Nodes Map */}
              <div className="space-y-1 rounded-xl">
                <div className="flex justify-between lg:justify-end gap-3 text-xs">
                  <span className="text-slate-400">Active Node Accent</span>
                  <span className="text-white font-bold">{palettePercent}%</span>
                </div>
                <div className="w-full lg:w-48 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-350 rounded-full transition-all duration-300" style={{ width: `${palettePercent}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Rebuild Cache card box */}
          <div className="bg-slate-900/60 border border-slate-900 p-5 rounded-3xl w-full max-w-xs shadow-2xl text-left">
            <div className="flex justify-between items-center mb-4">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-555 bg-emerald-500 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              </span>
              <p className="text-slate-500 text-[9px] font-bold font-mono uppercase tracking-wider">Version 4.0.2</p>
            </div>
            
            <p className="text-slate-300 text-xs mb-4 leading-relaxed">
              System build verified. Local databases bound & active. All dynamic color swatches mapped successfully.
            </p>
            
            <button
              onClick={resetToDefaults}
              className="w-full py-2.5 bg-slate-800 text-white text-xs font-bold rounded-xl border border-slate-700 hover:bg-slate-750 transition duration-150 cursor-pointer"
            >
              REBUILD CACHE
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
