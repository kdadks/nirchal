// Cookie Management Utilities

export interface GuestUserInfo {
  name: string;
  email: string;
  phone: string;
  capturedAt: string;
}

const GUEST_INFO_COOKIE = 'nirchal_guest_info';
const COOKIE_EXPIRY_DAYS = 365; // 1 year

/**
 * Set a cookie with an expiration date
 */
export const setCookie = (name: string, value: string, days: number = COOKIE_EXPIRY_DAYS): void => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
};

/**
 * Get a cookie value by name
 */
export const getCookie = (name: string): string | null => {
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(';');
  
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1, cookie.length);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length, cookie.length);
    }
  }
  return null;
};

/**
 * Remove a cookie
 */
export const removeCookie = (name: string): void => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

/**
 * Save guest user information to cookie
 */
export const saveGuestInfo = (info: Omit<GuestUserInfo, 'capturedAt'>): void => {
  const guestInfo: GuestUserInfo = {
    ...info,
    capturedAt: new Date().toISOString(),
  };
  
  const encodedInfo = encodeURIComponent(JSON.stringify(guestInfo));
  setCookie(GUEST_INFO_COOKIE, encodedInfo);
};

/**
 * Get guest user information from cookie
 */
export const getGuestInfo = (): GuestUserInfo | null => {
  const cookieValue = getCookie(GUEST_INFO_COOKIE);
  
  if (!cookieValue) {
    return null;
  }
  
  try {
    const decodedInfo = decodeURIComponent(cookieValue);
    return JSON.parse(decodedInfo);
  } catch (error) {
    console.error('Error parsing guest info cookie:', error);
    return null;
  }
};

/**
 * Remove guest user information from cookie
 */
export const removeGuestInfo = (): void => {
  removeCookie(GUEST_INFO_COOKIE);
};

/**
 * Check if guest info exists in cookie
 */
export const hasGuestInfo = (): boolean => {
  return getGuestInfo() !== null;
};

/**
 * Update guest user information (partial update)
 */
export const updateGuestInfo = (partialInfo: Partial<Omit<GuestUserInfo, 'capturedAt'>>): void => {
  const existingInfo = getGuestInfo();
  
  if (existingInfo) {
    const updatedInfo = {
      name: partialInfo.name ?? existingInfo.name,
      email: partialInfo.email ?? existingInfo.email,
      phone: partialInfo.phone ?? existingInfo.phone,
    };
    saveGuestInfo(updatedInfo);
  } else {
    // If no existing info, create new with provided fields (empty strings for missing fields)
    const newInfo = {
      name: partialInfo.name ?? '',
      email: partialInfo.email ?? '',
      phone: partialInfo.phone ?? '',
    };
    saveGuestInfo(newInfo);
  }
};
