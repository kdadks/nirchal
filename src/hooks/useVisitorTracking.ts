import { useEffect, useRef, useState } from 'react';
import { supabase } from '../config/supabase';

interface LocationInfo {
  ip_address?: string;
  city?: string;
  country?: string;
  country_code?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
}

interface VisitorInfo {
  visitor_id: string;
  browser: string;
  os: string;
  device_type: string;
  screen_resolution: string;
  referrer: string;
  location?: LocationInfo;
}

const VISITOR_COOKIE_NAME = 'nirchal_visitor_id';
const COOKIE_EXPIRY_DAYS = 365;

// Generate a unique visitor ID
const generateVisitorId = (): string => {
  return `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get or create visitor ID from cookie
const getVisitorId = (): string => {
  const cookies = document.cookie.split(';');
  const visitorCookie = cookies.find(c => c.trim().startsWith(`${VISITOR_COOKIE_NAME}=`));
  
  if (visitorCookie) {
    return visitorCookie.split('=')[1];
  }
  
  // Create new visitor ID
  const newVisitorId = generateVisitorId();
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + COOKIE_EXPIRY_DAYS);
  document.cookie = `${VISITOR_COOKIE_NAME}=${newVisitorId}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
  
  return newVisitorId;
};

// Detect browser
const detectBrowser = (): string => {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  return 'Unknown';
};

// Detect OS
const detectOS = (): string => {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Unknown';
};

// Detect device type
const detectDeviceType = (): string => {
  const userAgent = navigator.userAgent;
  if (/mobile/i.test(userAgent)) return 'Mobile';
  if (/tablet/i.test(userAgent)) return 'Tablet';
  return 'Desktop';
};

// Get screen resolution
const getScreenResolution = (): string => {
  return `${window.screen.width}x${window.screen.height}`;
};

// Get referrer
const getReferrer = (): string => {
  return document.referrer || 'Direct';
};

// Check if running on localhost or development environment
const isLocalhost = (): boolean => {
  const hostname = window.location.hostname;
  return hostname === 'localhost' || 
         hostname === '127.0.0.1' || 
         hostname === '[::1]' ||
         hostname.startsWith('192.168.') ||
         hostname.startsWith('10.') ||
         hostname.endsWith('.local');
};

// Fetch IP and location data from ipapi.co (free tier: 1000 requests/day)
const fetchLocationData = async (): Promise<LocationInfo | null> => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) return null;
    
    const data = await response.json();
    return {
      ip_address: data.ip,
      city: data.city,
      country: data.country_name,
      country_code: data.country_code,
      region: data.region,
      latitude: data.latitude,
      longitude: data.longitude
    };
  } catch (error) {
    console.warn('Failed to fetch location data:', error);
    return null;
  }
};

export const useVisitorTracking = () => {
  const visitorIdRef = useRef<string | null>(null);
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const sessionStartRef = useRef<number>(Date.now());
  const pageViewsRef = useRef<number>(0);
  const hasTrackedRef = useRef<boolean>(false);

  useEffect(() => {
    // Don't track if on localhost or development environment
    if (isLocalhost()) {
      console.log('Visitor tracking disabled on localhost');
      return;
    }

    // Get or create visitor ID
    visitorIdRef.current = getVisitorId();
    setVisitorId(visitorIdRef.current); // Set state to trigger re-render

    // Fetch location data and gather visitor info
    const initTracking = async () => {
      const locationData = await fetchLocationData();
      
      const visitorInfo: VisitorInfo = {
        visitor_id: visitorIdRef.current!,
        browser: detectBrowser(),
        os: detectOS(),
        device_type: detectDeviceType(),
        screen_resolution: getScreenResolution(),
        referrer: getReferrer(),
        location: locationData || undefined
      };

      // Track initial visit
      if (hasTrackedRef.current) return;

      try {
        // Check if visitor exists
        const { data: existingVisitor, error: fetchError} = await supabase
          .from('guest_visitors')
          .select('id, pages_visited, time_spent, visit_count')
          .eq('visitor_id', visitorInfo.visitor_id)
          .maybeSingle(); // Use maybeSingle() instead of single() to avoid errors

        if (fetchError) {
          // Silently fail - visitor tracking is not critical
          // Table might not exist yet or RLS might block access
          hasTrackedRef.current = true;
          return;
        }

        if (existingVisitor) {
          // Update existing visitor with location data
          const updateData: any = {
            last_visit: new Date().toISOString(),
            pages_visited: (Number(existingVisitor.pages_visited) || 0) + 1,
            visit_count: (Number(existingVisitor.visit_count) || 0) + 1,
            browser: visitorInfo.browser,
            os: visitorInfo.os,
            device_type: visitorInfo.device_type,
            screen_resolution: visitorInfo.screen_resolution
          };

          // Add location data if available
          if (visitorInfo.location) {
            updateData.ip_address = visitorInfo.location.ip_address;
            updateData.city = visitorInfo.location.city;
            updateData.country = visitorInfo.location.country;
            updateData.country_code = visitorInfo.location.country_code;
            updateData.region = visitorInfo.location.region;
            updateData.latitude = visitorInfo.location.latitude;
            updateData.longitude = visitorInfo.location.longitude;
          }

          await supabase
            .from('guest_visitors')
            .update(updateData)
            .eq('visitor_id', visitorInfo.visitor_id);
        } else {
          // Create new visitor with location data
          const insertData: any = {
            visitor_id: visitorInfo.visitor_id,
            browser: visitorInfo.browser,
            os: visitorInfo.os,
            device_type: visitorInfo.device_type,
            screen_resolution: visitorInfo.screen_resolution,
            referrer: visitorInfo.referrer,
            pages_visited: 1,
            visit_count: 1,
            time_spent: 0,
            first_visit: new Date().toISOString(),
            last_visit: new Date().toISOString()
          };

          // Add location data if available
          if (visitorInfo.location) {
            insertData.ip_address = visitorInfo.location.ip_address;
            insertData.city = visitorInfo.location.city;
            insertData.country = visitorInfo.location.country;
            insertData.country_code = visitorInfo.location.country_code;
            insertData.region = visitorInfo.location.region;
            insertData.latitude = visitorInfo.location.latitude;
            insertData.longitude = visitorInfo.location.longitude;
          }

          const { error: insertError } = await supabase
            .from('guest_visitors')
            .insert(insertData);

          if (insertError) {
            // Silent fail - don't show errors to users
          }
        }

        hasTrackedRef.current = true;
      } catch (error) {
        // Silent fail - don't show errors to users
        hasTrackedRef.current = true; // Mark as tracked even on error to avoid infinite retries
      }
    };

    initTracking();

    // Track page views
    pageViewsRef.current++;

    // Update time spent every minute
    const timeInterval = setInterval(() => {
      updateTimeSpent();
    }, 60000); // Every 1 minute

    // Track page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updateTimeSpent();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Track before page unload
    const handleBeforeUnload = () => {
      updateTimeSpent();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(timeInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      updateTimeSpent();
    };
  }, []);

  const updateTimeSpent = async () => {
    if (!visitorIdRef.current) return;

    const timeSpentSeconds = Math.floor((Date.now() - sessionStartRef.current) / 1000);

    try {
      const { data: visitor } = await supabase
        .from('guest_visitors')
        .select('time_spent')
        .eq('visitor_id', visitorIdRef.current)
        .single();

      if (visitor) {
        await supabase
          .from('guest_visitors')
          .update({
            time_spent: (Number(visitor.time_spent) || 0) + timeSpentSeconds
          })
          .eq('visitor_id', visitorIdRef.current);

        // Reset session start for next interval
        sessionStartRef.current = Date.now();
      }
    } catch (error) {
      // Silent fail
    }
  };

  return {
    visitorId: visitorId
  };
};
