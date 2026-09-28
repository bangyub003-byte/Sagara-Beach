import React, { createContext, useContext, useState, useEffect } from 'react';
import { Booking, Property, RoomType, UserRole, Language, BookingStatus } from '../types';
import { INITIAL_PROPERTIES } from '../data/properties';
import { INITIAL_BOOKINGS } from '../data/initialBookings';
import { generateQrCode } from '../utils/qr';
import { translations } from '../utils/translations';

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
  checkInBooking: (id: string) => Promise<{ success: boolean; message: string; booking?: Booking }>;
  findBookingById: (id: string) => Booking | undefined;

  // Favorit
  favorites: string[];
  toggleFavorite: (propertyId: string) => void;
  isFavorite: (propertyId: string) => boolean;

  // Mobile Shell Mode
  mobileFrameMode: boolean;
  setMobileFrameMode: (enabled: boolean) => void;

  // Foto Hero & Kontak WA Admin
  heroImage: string;
  updateHeroImage: (url: string) => void;
  adminWhatsappNumber: string;
  updateAdminWhatsappNumber: (num: string) => void;
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

  // 3. Accommodations state
  const [accommodations, setAccommodations] = useState<Property[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_PROPERTIES_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return INITIAL_PROPERTIES;
  });

  const [selectedProperty, setSelectedProperty] = useState<Property>(() => accommodations[0] || INITIAL_PROPERTIES[0]);
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(() => accommodations[0]?.roomTypes[0] || null);

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

  // 6. Foto Hero & Nomor WhatsApp Admin
  const [heroImage, setHeroImage] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_HERO_IMAGE_KEY);
      if (saved) return saved;
    } catch {
      // fallback
    }
    return 'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&w=1200&q=85';
  });

  const updateHeroImage = (url: string) => {
    setHeroImage(url);
    try {
      localStorage.setItem(LOCAL_STORAGE_HERO_IMAGE_KEY, url);
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
        isDateOverlapping(checkIn, checkOut, b.checkInDate, b.checkOutDate)
    );
    return !hasConflict;
  };

  const checkTrenggoleRoomAvailability = (roomId: string, checkIn: string, checkOut: string): boolean => {
    if (!checkIn || !checkOut || checkIn >= checkOut) return true;
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
        (b.roomTypeId === roomId || (b.roomChoiceDetail && b.roomChoiceDetail.includes(roomId))) &&
        isDateOverlapping(checkIn, checkOut, b.checkInDate, b.checkOutDate)
    );
    return !hasConflict;
  };

  const createBooking = async (
    bookingData: Omit<Booking, 'id' | 'status' | 'createdAt'>
  ): Promise<string> => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newId = `GBH-${randomSuffix}`;

    const qrDataPayload = `BAROKAH:BOOKING:${newId}|GUEST:${bookingData.guestName}|NIK:${bookingData.guestNik}|ROOM:${bookingData.roomTypeName}`;
    const qrCodeImage = await generateQrCode(qrDataPayload);

    const newBooking: Booking = {
      ...bookingData,
      id: newId,
      status: 'pending_verification',
      createdAt: new Date().toISOString(),
      qrCodeData: qrCodeImage,
      adminNotes: 'Awaiting admin review of KTP and payment proof.',
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
    id: string
  ): Promise<{ success: boolean; message: string; booking?: Booking }> => {
    const target = bookings.find((b) => b.id.trim().toUpperCase() === id.trim().toUpperCase());

    if (!target) {
      return { success: false, message: `Booking ID "${id}" tidak ditemukan dalam database resor.` };
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
        message: `Booking ${target.id} masih dalam antrean verifikasi Admin.`,
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
        adminWhatsappNumber,
        updateAdminWhatsappNumber,
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
