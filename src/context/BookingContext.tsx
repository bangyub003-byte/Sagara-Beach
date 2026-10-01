import React, { createContext, useContext, useState, useEffect } from 'react';
import { Booking, Property, RoomType, UserRole, Language, BookingStatus } from '../types';
import { INITIAL_PROPERTIES } from '../data/properties';
import { INITIAL_BOOKINGS } from '../data/initialBookings';
import { generateQrCode } from '../utils/qr';
import { translations } from '../utils/translations';
import {
  generateUniqueBookingCode,
  generateBookingSignature,
  verifyBookingSignature,
} from '../utils/securityHelper';
import {
  CMSDatabase,
  convertCmsToProperties,
  TB_Homepage_Content,
  TB_Homestay,
  TB_Room,
  TB_Media,
  TB_Website_Settings,
  TB_User,
  TB_Activity_Log,
} from '../db/cmsDatabase';

interface BookingContextType {
  // Bahasa
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (typeof translations)['id'];

  // Role & Sesi Login Staf
  role: UserRole;
  setRole: (role: UserRole) => void;
  isAdminAuthenticated: boolean;
  isReceptionistAuthenticated: boolean;
  loginAdmin: (passcode: string) => boolean;
  loginReceptionist: (passcode: string) => boolean;
  logoutStaff: () => void;

  // Navigasi Tampilan & Route URL
  currentRoute: string;
  navigateTo: (path: string) => void;
  currentView: string;
  setCurrentView: (view: string) => void;

  // Akomodasi & Tipe Kamar
  accommodations: Property[];
  selectedProperty: Property;
  setSelectedProperty: (prop: Property) => void;
  selectedRoomType: RoomType | null;
  setSelectedRoomType: (room: RoomType | null) => void;

  // Admin CRUD Akomodasi & Kamar
  addAccommodation: (prop: Omit<Property, 'id'>) => void;
  updateAccommodation: (id: string, data: Partial<Property>) => void;
  deleteAccommodation: (id: string) => void;
  addRoomType: (propertyId: string, room: Omit<RoomType, 'id'>) => void;
  updateRoomType: (propertyId: string, roomId: string, data: Partial<RoomType>) => void;
  deleteRoomType: (propertyId: string, roomId: string) => void;
  toggleRoomAvailability: (propertyId: string, roomId: string) => void;
  toggleDateBlock: (propertyId: string, dateStr: string, roomId?: string) => void;
  resetToDefaultData: () => void;

  // Bookings state
  bookings: Booking[];
  activeBookingId: string | null;
  setActiveBookingId: (id: string | null) => void;
  activeBooking: Booking | null;

  // Ketersediaan Otomatis Berdasarkan Tanggal
  checkSundakAvailability: (checkIn: string, checkOut: string) => boolean;
  checkTrenggoleRoomAvailability: (roomId: string, checkIn: string, checkOut: string) => boolean;
  isDateOverlapping: (startA: string, endA: string, startB: string, endB: string) => boolean;

  // Aksi Tamu
  createBooking: (bookingData: Omit<Booking, 'id' | 'status' | 'createdAt'>) => Promise<string>;

  // Aksi Admin
  verifyBooking: (id: string, notes?: string) => Promise<boolean>;
  rejectBooking: (id: string, reason?: string) => Promise<boolean>;
  updateBookingStatus: (id: string, status: BookingStatus, notes?: string) => Promise<boolean>;

  // Aksi Resepsionis
  checkInBooking: (id: string, signature?: string) => Promise<{ success: boolean; message: string; booking?: Booking }>;
  findBookingById: (id: string) => Booking | undefined;

  // Favorit
  favorites: string[];
  toggleFavorite: (propertyId: string) => void;
  isFavorite: (propertyId: string) => boolean;

  // Mobile Shell Mode
  mobileFrameMode: boolean;
  setMobileFrameMode: (enabled: boolean) => void;

  // Foto Hero, Foto Fasilitas & Kontak WA Admin
  heroImage: string;
  updateHeroImage: (url: string) => void;
  facilityImage: string;
  updateFacilityImage: (url: string) => void;
  adminWhatsappNumber: string;
  updateAdminWhatsappNumber: (num: string) => void;

  // CMS Database Tables & Operations
  homepageContent: TB_Homepage_Content;
  updateHomepageContent: (data: Partial<TB_Homepage_Content>) => void;
  cmsHomestays: TB_Homestay[];
  addCmsHomestay: (homestay: TB_Homestay) => void;
  updateCmsHomestay: (id: string, data: Partial<TB_Homestay>) => void;
  deleteCmsHomestay: (id: string) => void;
  cmsRooms: TB_Room[];
  updateCmsRoom: (id: string, data: Partial<TB_Room>) => void;
  addCmsRoom: (room: TB_Room) => void;
  deleteCmsRoom: (id: string) => void;
  cmsMedia: TB_Media[];
  uploadMedia: (file: File, kategori: TB_Media['kategori']) => Promise<TB_Media>;
  deleteMedia: (id: string) => void;
  websiteSettings: Record<string, string>;
  getWebsiteSetting: (key: string, defaultValue?: string) => string;
  updateWebsiteSetting: (key: string, value: string, kategori?: TB_Website_Settings['kategori']) => void;
  updateMultipleSettings: (records: Record<string, { value: string; kategori?: TB_Website_Settings['kategori'] }>) => void;
  cmsUsers: TB_User[];
  saveCmsUser: (user: TB_User) => void;
  deleteCmsUser: (id: string) => void;
  cmsActivityLogs: TB_Activity_Log[];
  logActivity: (entry: Omit<TB_Activity_Log, 'id' | 'waktu'>) => void;
  resetCmsDatabase: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const LOCAL_STORAGE_PROPERTIES_KEY = 'barokah_accommodations_v9';
const LOCAL_STORAGE_BOOKINGS_KEY = 'barokah_bookings_v9';
const LOCAL_STORAGE_LANG_KEY = 'barokah_language_v1';
const LOCAL_STORAGE_FAV_KEY = 'barokah_favs_v1';
const LOCAL_STORAGE_ADMIN_AUTH_KEY = 'barokah_admin_auth_v1';
const LOCAL_STORAGE_RECEPTION_AUTH_KEY = 'barokah_reception_auth_v1';
const LOCAL_STORAGE_HERO_IMAGE_KEY = 'barokah_hero_img_v2';
const LOCAL_STORAGE_ADMIN_WA_KEY = 'barokah_admin_wa_v2';

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Language State
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_LANG_KEY);
      if (saved === 'id' || saved === 'en') return saved;
    } catch {
      // fallback
    }
    return 'id';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LOCAL_STORAGE_LANG_KEY, lang);
    } catch {
      // ignore
    }
  };

  const t = translations[language];

  // 2. Navigation & Staff Auth
  const [role, setRole] = useState<UserRole>('customer');
  const [currentView, setCurrentView] = useState<string>('landing');
  const [mobileFrameMode, setMobileFrameMode] = useState<boolean>(false);
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    try {
      return window.location.pathname || '/';
    } catch {
      return '/';
    }
  });

  const navigateTo = (path: string) => {
    try {
      window.history.pushState({}, '', path);
      setCurrentRoute(path);
    } catch {
      // ignore
    }

    if (path.startsWith('/admin')) {
      setRole('admin');
    } else if (path.startsWith('/receptionist')) {
      setRole('receptionist');
    } else {
      setRole('customer');
      if (path === '/' || path === '/home') {
        setCurrentView('home');
      }
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      try {
        const path = window.location.pathname || '/';
        setCurrentRoute(path);
        if (path.startsWith('/admin')) {
          setRole('admin');
        } else if (path.startsWith('/receptionist')) {
          setRole('receptionist');
        } else {
          setRole('customer');
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_ADMIN_AUTH_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [isReceptionistAuthenticated, setIsReceptionistAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_RECEPTION_AUTH_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const loginAdmin = (passcode: string): boolean => {
    // Validasi passcode admin sederhana untuk staf resor
    if (passcode.trim() === 'admin123' || passcode.trim() === 'sagara88') {
      setIsAdminAuthenticated(true);
      setRole('admin');
      setCurrentView('admin_dashboard');
      try {
        localStorage.setItem(LOCAL_STORAGE_ADMIN_AUTH_KEY, 'true');
      } catch {
        // ignore
      }
      return true;
    }
    return false;
  };

  const loginReceptionist = (passcode: string): boolean => {
    // Validasi passcode resepsionis
    if (passcode.trim() === 'frontdesk' || passcode.trim() === 'lobi123') {
      setIsReceptionistAuthenticated(true);
      setRole('receptionist');
      setCurrentView('reception_scan');
      try {
        localStorage.setItem(LOCAL_STORAGE_RECEPTION_AUTH_KEY, 'true');
      } catch {
        // ignore
      }
      return true;
    }
    return false;
  };

  const logoutStaff = () => {
    setIsAdminAuthenticated(false);
    setIsReceptionistAuthenticated(false);
    setRole('customer');
    setCurrentView('home');
    try {
      localStorage.removeItem(LOCAL_STORAGE_ADMIN_AUTH_KEY);
      localStorage.removeItem(LOCAL_STORAGE_RECEPTION_AUTH_KEY);
      window.history.pushState({}, '', '/');
      setCurrentRoute('/');
    } catch {
      // ignore
    }
  };

  // 3. CMS Database States
  const [homepageContent, setHomepageContentState] = useState<TB_Homepage_Content>(() =>
    CMSDatabase.getHomepageContent()
  );
  const [cmsHomestays, setCmsHomestaysState] = useState<TB_Homestay[]>(() =>
    CMSDatabase.getHomestays()
  );
  const [cmsRooms, setCmsRoomsState] = useState<TB_Room[]>(() =>
    CMSDatabase.getRooms()
  );
  const [cmsMedia, setCmsMediaState] = useState<TB_Media[]>(() =>
    CMSDatabase.getMediaList()
  );
  const [websiteSettingsList, setWebsiteSettingsList] = useState<TB_Website_Settings[]>(() =>
    CMSDatabase.getWebsiteSettings()
  );
  const [cmsUsers, setCmsUsers] = useState<TB_User[]>(() => CMSDatabase.getUsers());
  const [cmsActivityLogs, setCmsActivityLogs] = useState<TB_Activity_Log[]>(() =>
    CMSDatabase.getActivityLogs()
  );

  // Sync accommodations from CMSDatabase
  const [accommodations, setAccommodations] = useState<Property[]>(() => {
    const homestays = CMSDatabase.getHomestays();
    const rooms = CMSDatabase.getRooms();
    const converted = convertCmsToProperties(homestays, rooms);
    if (converted.length > 0) return converted;
    return INITIAL_PROPERTIES;
  });

  const [selectedProperty, setSelectedProperty] = useState<Property>(() => {
    const homestays = CMSDatabase.getHomestays();
    const rooms = CMSDatabase.getRooms();
    const converted = convertCmsToProperties(homestays, rooms);
    return converted[0] || INITIAL_PROPERTIES[0];
  });

  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(() => {
    const homestays = CMSDatabase.getHomestays();
    const rooms = CMSDatabase.getRooms();
    const converted = convertCmsToProperties(homestays, rooms);
    return converted[0]?.roomTypes[0] || null;
  });

  // Listen to CMS Database updates across tabs and components
  useEffect(() => {
    const handleCmsUpdate = () => {
      const freshHome = CMSDatabase.getHomepageContent();
      const freshHomestays = CMSDatabase.getHomestays();
      const freshRooms = CMSDatabase.getRooms();
      const freshMedia = CMSDatabase.getMediaList();
      const freshSettings = CMSDatabase.getWebsiteSettings();
      const freshUsers = CMSDatabase.getUsers();
      const freshLogs = CMSDatabase.getActivityLogs();

      setHomepageContentState(freshHome);
      setCmsHomestaysState(freshHomestays);
      setCmsRoomsState(freshRooms);
      setCmsMediaState(freshMedia);
      setWebsiteSettingsList(freshSettings);
      setCmsUsers(freshUsers);
      setCmsActivityLogs(freshLogs);

      const mapped = convertCmsToProperties(freshHomestays, freshRooms);
      setAccommodations(mapped);

      // Preserve or update selectedProperty
      setSelectedProperty((prev) => {
        const found = mapped.find((m) => m.id === prev.id);
        return found || mapped[0];
      });
    };

    window.addEventListener('cms_database_updated', handleCmsUpdate);
    return () => {
      window.removeEventListener('cms_database_updated', handleCmsUpdate);
    };
  }, []);

  // 4. Bookings State
  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_BOOKINGS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return INITIAL_BOOKINGS as any;
  });

  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);

  // 5. Favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_FAV_KEY);
      return saved ? JSON.parse(saved) : ['ocean-pavilion'];
    } catch {
      return ['ocean-pavilion'];
    }
  });

  // 6. Foto Hero, Foto Fasilitas & Nomor WhatsApp Admin
  const [heroImage, setHeroImage] = useState<string>(() => {
    try {
      const cmsHero = CMSDatabase.getHomepageContent()?.hero_image;
      if (cmsHero) return cmsHero;
      const saved = localStorage.getItem(LOCAL_STORAGE_HERO_IMAGE_KEY);
      if (saved && !saved.includes('unsplash.com')) return saved;
    } catch {
      // fallback
    }
    return '/images/sundak_fullhouse_1790552054893.jpg';
  });

  const updateHeroImage = (url: string) => {
    setHeroImage(url);
    CMSDatabase.saveHomepageContent({ hero_image: url });
    setHomepageContentState(CMSDatabase.getHomepageContent());
    try {
      localStorage.setItem(LOCAL_STORAGE_HERO_IMAGE_KEY, url);
    } catch {
      // ignore
    }
  };

  const [facilityImage, setFacilityImage] = useState<string>(() => {
    try {
      const setting = CMSDatabase.getWebsiteSetting('facility_image');
      if (setting) return setting;
      const mediaFacility = CMSDatabase.getMediaList('fasilitas')?.[0]?.url;
      if (mediaFacility) return mediaFacility;
      const saved = localStorage.getItem('barokah_facility_img_v2');
      if (saved) return saved;
    } catch {
      // fallback
    }
    return '/images/living_room_1790552074900.jpg';
  });

  const updateFacilityImage = (url: string) => {
    setFacilityImage(url);
    CMSDatabase.saveWebsiteSetting('facility_image', url, 'homepage');
    setWebsiteSettingsList(CMSDatabase.getWebsiteSettings());
    try {
      localStorage.setItem('barokah_facility_img_v2', url);
    } catch {
      // ignore
    }
  };

  const [adminWhatsappNumber, setAdminWhatsappNumber] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ADMIN_WA_KEY);
      if (saved) return saved;
    } catch {
      // fallback
    }
    return '082138613888';
  });

  const updateAdminWhatsappNumber = (num: string) => {
    setAdminWhatsappNumber(num);
    try {
      localStorage.setItem(LOCAL_STORAGE_ADMIN_WA_KEY, num);
    } catch {
      // ignore
    }
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_PROPERTIES_KEY, JSON.stringify(accommodations));
    } catch {
      // ignore
    }
  }, [accommodations]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_BOOKINGS_KEY, JSON.stringify(bookings));
    } catch {
      // ignore
    }
  }, [bookings]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_FAV_KEY, JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  const activeBooking = bookings.find((b) => b.id === activeBookingId) || null;

  const toggleFavorite = (propertyId: string) => {
    setFavorites((prev) =>
      prev.includes(propertyId) ? prev.filter((id) => id !== propertyId) : [...prev, propertyId]
    );
  };

  const isFavorite = (propertyId: string) => favorites.includes(propertyId);

  // ================= ADMIN CRUD OPERATIONS =================
  const addAccommodation = (newPropData: Omit<Property, 'id'>) => {
    const newId = `acc-${Date.now()}`;
    const newProp: Property = {
      ...newPropData,
      id: newId,
    };
    setAccommodations((prev) => [...prev, newProp]);
  };

  const updateAccommodation = (id: string, data: Partial<Property>) => {
    setAccommodations((prev) =>
      prev.map((prop) => {
        if (prop.id === id) {
          const updated = { ...prop, ...data };
          if (selectedProperty.id === id) setSelectedProperty(updated);
          return updated;
        }
        return prop;
      })
    );
  };

  const deleteAccommodation = (id: string) => {
    setAccommodations((prev) => prev.filter((p) => p.id !== id));
    if (selectedProperty.id === id && accommodations.length > 1) {
      setSelectedProperty(accommodations.find((p) => p.id !== id)!);
    }
  };

  const addRoomType = (propertyId: string, newRoomData: Omit<RoomType, 'id'>) => {
    const newRoomId = `room-${Date.now()}`;
    const newRoom: RoomType = {
      ...newRoomData,
      id: newRoomId,
    };
    setAccommodations((prev) =>
      prev.map((prop) => {
        if (prop.id === propertyId) {
          const updated = { ...prop, roomTypes: [...prop.roomTypes, newRoom] };
          if (selectedProperty.id === propertyId) setSelectedProperty(updated);
          return updated;
        }
        return prop;
      })
    );
  };

  const updateRoomType = (propertyId: string, roomId: string, data: Partial<RoomType>) => {
    setAccommodations((prev) =>
      prev.map((prop) => {
        if (prop.id === propertyId) {
          const updatedRooms = prop.roomTypes.map((r) => (r.id === roomId ? { ...r, ...data } : r));
          const updated = { ...prop, roomTypes: updatedRooms };
          if (selectedProperty.id === propertyId) setSelectedProperty(updated);
          return updated;
        }
        return prop;
      })
    );
  };

  const deleteRoomType = (propertyId: string, roomId: string) => {
    setAccommodations((prev) =>
      prev.map((prop) => {
        if (prop.id === propertyId) {
          const updatedRooms = prop.roomTypes.filter((r) => r.id !== roomId);
          const updated = { ...prop, roomTypes: updatedRooms };
          if (selectedProperty.id === propertyId) setSelectedProperty(updated);
          return updated;
        }
        return prop;
      })
    );
  };

  const toggleRoomAvailability = (propertyId: string, roomId: string) => {
    setAccommodations((prev) =>
      prev.map((prop) => {
        if (prop.id === propertyId) {
          const updatedRooms = prop.roomTypes.map((r) =>
            r.id === roomId ? { ...r, isAvailable: !r.isAvailable } : r
          );
          const updated = { ...prop, roomTypes: updatedRooms };
          if (selectedProperty.id === propertyId) setSelectedProperty(updated);
          return updated;
        }
        return prop;
      })
    );
  };

  const toggleDateBlock = (propertyId: string, dateStr: string, roomId?: string) => {
    setAccommodations((prev) =>
      prev.map((prop) => {
        if (prop.id !== propertyId) return prop;

        if (roomId) {
          // Block specific room
          const updatedRooms = prop.roomTypes.map((r) => {
            if (r.id !== roomId) return r;
            const currentBlocked = r.blockedDates || [];
            const newBlocked = currentBlocked.includes(dateStr)
              ? currentBlocked.filter((d) => d !== dateStr)
              : [...currentBlocked, dateStr];
            return { ...r, blockedDates: newBlocked };
          });
          const updated = { ...prop, roomTypes: updatedRooms };
          if (selectedProperty.id === propertyId) setSelectedProperty(updated);
          return updated;
        } else {
          // Block entire property
          const currentBlocked = prop.blockedDates || [];
          const newBlocked = currentBlocked.includes(dateStr)
            ? currentBlocked.filter((d) => d !== dateStr)
            : [...currentBlocked, dateStr];
          const updated = { ...prop, blockedDates: newBlocked };
          if (selectedProperty.id === propertyId) setSelectedProperty(updated);
          return updated;
        }
      })
    );
  };

  const resetToDefaultData = () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_PROPERTIES_KEY);
      localStorage.removeItem(LOCAL_STORAGE_BOOKINGS_KEY);
    } catch {
      // ignore
    }
    setAccommodations(INITIAL_PROPERTIES);
    setSelectedProperty(INITIAL_PROPERTIES[0]);
    setSelectedRoomType(INITIAL_PROPERTIES[0].roomTypes[0]);
    setBookings(INITIAL_BOOKINGS);
  };

  // ================= TAMU & BOOKING ACTIONS =================
  const isDateOverlapping = (startA: string, endA: string, startB: string, endB: string): boolean => {
    if (!startA || !endA || !startB || !endB) return false;
    return startA < endB && endA > startB;
  };

  const checkSundakAvailability = (checkIn: string, checkOut: string): boolean => {
    if (!checkIn || !checkOut || checkIn >= checkOut) return true;
    // Cek entitas tabel blocked dates di CMS
    if (CMSDatabase.isDateRangeBlocked('homestay-sundak', checkIn, checkOut)) {
      return false;
    }
    const sundak = accommodations.find((a) => a.id === 'homestay-sundak');
    if (sundak?.blockedDates) {
      for (const d of sundak.blockedDates) {
        if (d >= checkIn && d < checkOut) return false;
      }
    }
    const hasConflict = bookings.some(
      (b) =>
        b.propertyId === 'homestay-sundak' &&
        b.status !== 'rejected' &&
        b.status !== 'cancelled' &&
        isDateOverlapping(checkIn, checkOut, b.checkInDate, b.checkOutDate)
    );
    return !hasConflict;
  };

  const checkTrenggoleRoomAvailability = (roomId: string, checkIn: string, checkOut: string): boolean => {
    if (!checkIn || !checkOut || checkIn >= checkOut) return true;
    // Cek entitas tabel blocked dates di CMS
    if (CMSDatabase.isDateRangeBlocked('homestay-trenggole', checkIn, checkOut, roomId)) {
      return false;
    }
    const trenggole = accommodations.find((a) => a.id === 'homestay-trenggole');
    const targetRoom = trenggole?.roomTypes.find((r) => r.id === roomId);
    if (targetRoom && targetRoom.isAvailable === false) return false;
    if (targetRoom?.blockedDates) {
      for (const d of targetRoom.blockedDates) {
        if (d >= checkIn && d < checkOut) return false;
      }
    }
    const hasConflict = bookings.some(
      (b) =>
        b.propertyId === 'homestay-trenggole' &&
        b.status !== 'rejected' &&
        b.status !== 'cancelled' &&
        (b.roomTypeId === roomId || (b.roomChoiceDetail && b.roomChoiceDetail.includes(roomId))) &&
        isDateOverlapping(checkIn, checkOut, b.checkInDate, b.checkOutDate)
    );
    return !hasConflict;
  };

  const createBooking = async (
    bookingData: Omit<Booking, 'id' | 'status' | 'createdAt'>
  ): Promise<string> => {
    // 1. Pengecekan bentrok tanggal SEKALI LAGI tepat sebelum disimpan (P1.D)
    if (bookingData.propertyId === 'homestay-sundak') {
      const isAvailable = checkSundakAvailability(bookingData.checkInDate, bookingData.checkOutDate);
      if (!isAvailable) {
        throw new Error(
          'Maaf, Griya Barokah Pantai Sundak (Full House) baru saja terisi atau tidak tersedia untuk rentang tanggal tersebut.'
        );
      }
    } else if (bookingData.propertyId === 'homestay-trenggole') {
      const isRoomAvailable = checkTrenggoleRoomAvailability(
        bookingData.roomTypeId,
        bookingData.checkInDate,
        bookingData.checkOutDate
      );
      if (!isRoomAvailable) {
        throw new Error(
          'Maaf, kamar di Pantai Trenggole yang Anda pilih baru saja dipesan oleh tamu lain pada rentang tanggal tersebut.'
        );
      }
    }

    // 2. Format kode booking anti-tabrakan: GBH-YYMM-XXXX (P1.D)
    const newId = generateUniqueBookingCode(bookings.map((b) => b.id));

    // 3. Tanda tangan keamanan digital QR tiket (P1.E)
    const signature = generateBookingSignature(newId, bookingData.guestPhone);

    // QR Payload berisi ID & Signature (JANGAN simpan status di dalam QR agar selalu dicek real-time di DB)
    const qrDataPayload = `GBH:BOOKING:${newId}|SIG:${signature}`;
    const qrCodeImage = await generateQrCode(qrDataPayload);

    const newBooking: Booking = {
      ...bookingData,
      id: newId,
      status: 'pending_verification',
      createdAt: new Date().toISOString(),
      qrCodeData: qrCodeImage,
      adminNotes: 'Awaiting admin review of KTP and payment proof.',
      signature,
    };

    setBookings((prev) => [newBooking, ...prev]);
    setActiveBookingId(newId);
    return newId;
  };

  const verifyBooking = async (id: string, notes?: string): Promise<boolean> => {
    let success = false;
    const qrCode = await generateQrCode(`SAGARA:BOOKING:${id}|STATUS:VERIFIED`);

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          success = true;
          return {
            ...b,
            status: 'verified',
            verifiedAt: new Date().toISOString(),
            adminNotes: notes || b.adminNotes || 'Verified by Resort Manager.',
            qrCodeData: b.qrCodeData || qrCode,
          };
        }
        return b;
      })
    );
    return success;
  };

  const rejectBooking = async (id: string, reason?: string): Promise<boolean> => {
    let success = false;
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          success = true;
          return {
            ...b,
            status: 'rejected',
            rejectionReason: reason || 'Dokumen KTP atau bukti transfer tidak valid.',
            adminNotes: `Ditolak: ${reason || 'Verifikasi tidak valid'}`,
          };
        }
        return b;
      })
    );
    return success;
  };

  const updateBookingStatus = async (id: string, status: BookingStatus, notes?: string): Promise<boolean> => {
    let success = false;
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          success = true;
          const updated: Booking = {
            ...b,
            status,
          };
          if (notes !== undefined) {
            updated.adminNotes = notes;
          }
          if (status === 'verified' && !updated.verifiedAt) {
            updated.verifiedAt = new Date().toISOString();
          } else if (status === 'checked_in' && !updated.checkedInAt) {
            updated.checkedInAt = new Date().toISOString();
          }
          return updated;
        }
        return b;
      })
    );
    return success;
  };

  const checkInBooking = async (
    id: string,
    signature?: string
  ): Promise<{ success: boolean; message: string; booking?: Booking }> => {
    const target = bookings.find((b) => b.id.trim().toUpperCase() === id.trim().toUpperCase());

    if (!target) {
      return { success: false, message: `Booking ID "${id}" tidak ditemukan dalam database resor.` };
    }

    // Verifikasi tanda tangan digital QR tiket jika signature disertakan (P1.E)
    if (signature) {
      const isValidSig = verifyBookingSignature(target.id, target.guestPhone, signature);
      if (!isValidSig) {
        return {
          success: false,
          message: 'Peringatan Keamanan: Tanda tangan digital QR Code tidak cocok (terdeteksi tidak resmi/palsu).',
          booking: target,
        };
      }
    }

    if (target.status === 'checked_in') {
      return {
        success: false,
        message: `Tamu ${target.guestName} sudah melakukan check-in pada pukul ${new Date(
          target.checkedInAt || ''
        ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
        booking: target,
      };
    }

    if (target.status === 'pending_verification') {
      return {
        success: false,
        message: `Booking ${target.id} masih berstatus Menunggu Verifikasi Admin. Silakan verifikasi bukti transfer terlebih dahulu.`,
        booking: target,
      };
    }

    if (target.status === 'rejected' || target.status === 'cancelled') {
      return {
        success: false,
        message: `Booking ${target.id} berstatus ${target.status === 'rejected' ? 'DITOLAK' : 'DIBATALKAN'}, tidak dapat melakukan check-in.`,
        booking: target,
      };
    }

    const checkInTime = new Date().toISOString();
    let checkedInObj: Booking | undefined;

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === target.id) {
          checkedInObj = {
            ...b,
            status: 'checked_in',
            checkedInAt: checkInTime,
          };
          return checkedInObj;
        }
        return b;
      })
    );

    return {
      success: true,
      message: `Selamat datang di Sagara Beach Stay! Tamu ${target.guestName} berhasil check-in di ${target.propertyName}.`,
      booking: checkedInObj || target,
    };
  };

  const findBookingById = (id: string): Booking | undefined => {
    return bookings.find(
      (b) =>
        b.id.toLowerCase() === id.toLowerCase() ||
        b.guestNik === id ||
        b.guestPhone.replace(/\D/g, '') === id.replace(/\D/g, '')
    );
  };

  // CMS Database Handlers
  const syncAccommodationsFromCms = () => {
    const freshHomestays = CMSDatabase.getHomestays();
    const freshRooms = CMSDatabase.getRooms();
    setCmsHomestaysState(freshHomestays);
    setCmsRoomsState(freshRooms);
    const mapped = convertCmsToProperties(freshHomestays, freshRooms);
    setAccommodations(mapped);
    setSelectedProperty((prev) => mapped.find((m) => m.id === prev?.id) || mapped[0]);
  };

  const updateHomepageContent = (data: Partial<TB_Homepage_Content>) => {
    const updated = CMSDatabase.saveHomepageContent(data);
    setHomepageContentState(updated);
    if (data.hero_image) {
      setHeroImage(data.hero_image);
      try {
        localStorage.setItem(LOCAL_STORAGE_HERO_IMAGE_KEY, data.hero_image);
      } catch {
        // ignore
      }
    }
  };

  const updateCmsHomestay = (id: string, data: Partial<TB_Homestay>) => {
    CMSDatabase.updateHomestay(id, data);
    syncAccommodationsFromCms();
  };

  const addCmsHomestay = (homestay: TB_Homestay) => {
    CMSDatabase.addHomestay(homestay);
    syncAccommodationsFromCms();
  };

  const deleteCmsHomestay = (id: string) => {
    CMSDatabase.deleteHomestay(id);
    syncAccommodationsFromCms();
  };

  const updateCmsRoom = (id: string, data: Partial<TB_Room>) => {
    CMSDatabase.updateRoom(id, data);
    syncAccommodationsFromCms();
  };

  const addCmsRoom = (room: TB_Room) => {
    CMSDatabase.saveRoom(room);
    syncAccommodationsFromCms();
  };

  const deleteCmsRoom = (id: string) => {
    CMSDatabase.deleteRoom(id);
    syncAccommodationsFromCms();
  };

  const uploadMedia = async (file: File, kategori: TB_Media['kategori']): Promise<TB_Media> => {
    const media = await CMSDatabase.uploadMediaFile(file, kategori);
    setCmsMediaState(CMSDatabase.getMediaList());
    return media;
  };

  const deleteMedia = (id: string) => {
    CMSDatabase.deleteMediaItem(id);
    setCmsMediaState(CMSDatabase.getMediaList());
  };

  const websiteSettings: Record<string, string> = React.useMemo(() => {
    const map: Record<string, string> = {};
    websiteSettingsList.forEach((s) => {
      map[s.key] = s.value;
    });
    return map;
  }, [websiteSettingsList]);

  const getWebsiteSetting = (key: string, defaultValue: string = ''): string => {
    return websiteSettings[key] || defaultValue;
  };

  const updateWebsiteSetting = (key: string, value: string, kategori?: TB_Website_Settings['kategori']) => {
    CMSDatabase.saveSetting(key, value, kategori);
    setWebsiteSettingsList(CMSDatabase.getWebsiteSettings());
  };

  const updateMultipleSettings = (records: Record<string, { value: string; kategori?: TB_Website_Settings['kategori'] }>) => {
    CMSDatabase.saveMultipleSettings(records);
    setWebsiteSettingsList(CMSDatabase.getWebsiteSettings());
  };

  const saveCmsUser = (user: TB_User) => {
    CMSDatabase.saveUser(user);
    setCmsUsers(CMSDatabase.getUsers());
  };

  const deleteCmsUser = (id: string) => {
    CMSDatabase.deleteUser(id);
    setCmsUsers(CMSDatabase.getUsers());
  };

  const logActivity = (entry: Omit<TB_Activity_Log, 'id' | 'waktu'>) => {
    CMSDatabase.logActivity(entry);
    setCmsActivityLogs(CMSDatabase.getActivityLogs());
  };

  const resetCmsDatabase = () => {
    CMSDatabase.resetDatabaseToDefaults();
  };

  return (
    <BookingContext.Provider
      value={{
        language,
        setLanguage,
        t,
        role,
        setRole,
        isAdminAuthenticated,
        isReceptionistAuthenticated,
        loginAdmin,
        loginReceptionist,
        logoutStaff,
        currentRoute,
        navigateTo,
        currentView,
        setCurrentView,
        accommodations,
        selectedProperty,
        setSelectedProperty,
        selectedRoomType,
        setSelectedRoomType,
        addAccommodation,
        updateAccommodation,
        deleteAccommodation,
        addRoomType,
        updateRoomType,
        deleteRoomType,
        toggleRoomAvailability,
        toggleDateBlock,
        resetToDefaultData,
        bookings,
        activeBookingId,
        setActiveBookingId,
        activeBooking,
        checkSundakAvailability,
        checkTrenggoleRoomAvailability,
        isDateOverlapping,
        createBooking,
        verifyBooking,
        rejectBooking,
        updateBookingStatus,
        checkInBooking,
        findBookingById,
        favorites,
        toggleFavorite,
        isFavorite,
        mobileFrameMode,
        setMobileFrameMode,
        heroImage,
        updateHeroImage,
        facilityImage,
        updateFacilityImage,
        adminWhatsappNumber,
        updateAdminWhatsappNumber,
        homepageContent,
        updateHomepageContent,
        cmsHomestays,
        addCmsHomestay,
        updateCmsHomestay,
        deleteCmsHomestay,
        cmsRooms,
        updateCmsRoom,
        addCmsRoom,
        deleteCmsRoom,
        cmsMedia,
        uploadMedia,
        deleteMedia,
        websiteSettings,
        getWebsiteSetting,
        updateWebsiteSetting,
        updateMultipleSettings,
        cmsUsers,
        saveCmsUser,
        deleteCmsUser,
        cmsActivityLogs,
        logActivity,
        resetCmsDatabase,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = (): BookingContextType => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
