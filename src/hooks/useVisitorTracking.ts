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
  
  // Check for specific browsers in order
  if (/firefox/i.test(userAgent)) return 'Firefox';
  if (/edg/i.test(userAgent)) return 'Edge';
  if (/opr|opera/i.test(userAgent)) return 'Opera';
  if (/chrome|chromium/i.test(userAgent)) return 'Chrome';
  if (/safari/i.test(userAgent)) return 'Safari';
  if (/trident/i.test(userAgent)) return 'Internet Explorer';
  
  console.warn('⚠️ Could not detect browser from UA:', userAgent);
  return 'Unknown';
};

// Detect OS
const detectOS = (): string => {
  const userAgent = navigator.userAgent;
  
  if (/win/i.test(userAgent)) return 'Windows';
  if (/mac/i.test(userAgent)) return 'macOS';
  if (/x11/i.test(userAgent)) return 'Linux';
  if (/android/i.test(userAgent)) return 'Android';
  if (/iphone|ipad|ipod/i.test(userAgent)) return 'iOS';
  
  console.warn('⚠️ Could not detect OS from UA:', userAgent);
  return 'Unknown';
};

// Detect device type
const detectDeviceType = (): string => {
  const userAgent = navigator.userAgent;
  
  if (/ipad|android(?!.*mobi)/i.test(userAgent)) return 'Tablet';
  if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(userAgent)) return 'Mobile';
  
  return 'Desktop';
};

// Get screen resolution
const getScreenResolution = (): string => {
  try {
    return `${window.screen.width}x${window.screen.height}`;
  } catch (error) {
    console.warn('⚠️ Could not get screen resolution');
    return 'Unknown';
  }
};

// Get referrer
const getReferrer = (): string => {
  return document.referrer || 'Direct';
};

// Excluded IP addresses (admin/developer IPs that should not be tracked)
const EXCLUDED_IP_ADDRESSES = [
  '192.168.0.199', // Admin machine
];

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

// Check if IP address should be excluded from tracking
const isExcludedIP = (ipAddress?: string): boolean => {
  if (!ipAddress) return false;
  return EXCLUDED_IP_ADDRESSES.includes(ipAddress);
};

// Fetch IP and location data from ipapi.co (free tier: 1000 requests/day)
const fetchLocationData = async (): Promise<LocationInfo | null> => {
  try {
    console.log('🌍 Fetching location data from ipapi.co...');
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
      console.warn(`⚠️ ipapi.co returned status ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    // Ensure we have at least IP address
    if (!data.ip) {
      console.warn('⚠️ No IP address in response');
      return null;
    }
    
    const locationInfo: LocationInfo = {
      ip_address: data.ip,
      city: data.city || undefined,
      country: data.country_name || undefined,
      country_code: data.country_code || undefined,
      region: data.region || undefined,
      latitude: data.latitude ? parseFloat(data.latitude) : undefined,
      longitude: data.longitude ? parseFloat(data.longitude) : undefined
    };
    
    console.log('✅ Location data fetched:', {
      ip: locationInfo.ip_address,
      city: locationInfo.city,
      country: locationInfo.country
    });
    
    return locationInfo;
  } catch (error) {
    console.error('❌ Failed to fetch location data:', error instanceof Error ? error.message : error);
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
      
      // Don't track if IP is in the excluded list
      if (locationData && isExcludedIP(locationData.ip_address)) {
        console.log('Visitor tracking disabled for excluded IP address');
        hasTrackedRef.current = true;
        return;
      }
      
      const visitorInfo: VisitorInfo = {
        visitor_id: visitorIdRef.current!,
        browser: detectBrowser(),
        os: detectOS(),
        device_type: detectDeviceType(),
        screen_resolution: getScreenResolution(),
        referrer: getReferrer(),
        location: locationData || undefined
      };

      console.log('%c👤 VISITOR INFO CAPTURED', 'color: #4F46E5; font-weight: bold; font-size: 12px;', {
        browser: visitorInfo.browser,
        os: visitorInfo.os,
        device_type: visitorInfo.device_type,
        screen_resolution: visitorInfo.screen_resolution,
        referrer: visitorInfo.referrer,
        userAgent: navigator.userAgent
      });
      
      console.group('🔍 Detection Details');
      console.log('Browser detected:', visitorInfo.browser);
      console.log('OS detected:', visitorInfo.os);
      console.log('Device type detected:', visitorInfo.device_type);
      console.log('Screen resolution:', visitorInfo.screen_resolution);
      console.groupEnd();

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
            updateData.ip_address = visitorInfo.location.ip_address || null;
            updateData.city = visitorInfo.location.city || null;
            updateData.country = visitorInfo.location.country || null;
            updateData.country_code = visitorInfo.location.country_code || null;
            updateData.region = visitorInfo.location.region || null;
            updateData.latitude = visitorInfo.location.latitude || null;
            updateData.longitude = visitorInfo.location.longitude || null;
            console.log('📍 Updating visitor with location:', updateData.city, updateData.country);
          } else {
            console.warn('⚠️ No location data for update');
          }

          const { error: updateError } = await supabase
            .from('guest_visitors')
            .update(updateData)
            .eq('visitor_id', visitorInfo.visitor_id);
          
          if (updateError) {
            console.error('❌ Error updating visitor:', updateError);
          } else {
            console.log('✅ Visitor updated successfully');
          }
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
            insertData.ip_address = visitorInfo.location.ip_address || null;
            insertData.city = visitorInfo.location.city || null;
            insertData.country = visitorInfo.location.country || null;
            insertData.country_code = visitorInfo.location.country_code || null;
            insertData.region = visitorInfo.location.region || null;
            insertData.latitude = visitorInfo.location.latitude || null;
            insertData.longitude = visitorInfo.location.longitude || null;
            console.log('📍 Creating visitor with location:', insertData.city, insertData.country);
          } else {
            console.warn('⚠️ No location data for new visitor');
            // Still set default values for location fields
            insertData.ip_address = null;
            insertData.city = null;
            insertData.country = null;
            insertData.country_code = null;
            insertData.region = null;
            insertData.latitude = null;
            insertData.longitude = null;
          }

          console.log('💾 Inserting visitor record:', {
            visitor_id: insertData.visitor_id,
            ip_address: insertData.ip_address,
            city: insertData.city,
            country: insertData.country
          });

          const { error: insertError } = await supabase
            .from('guest_visitors')
            .insert(insertData);

          if (insertError) {
            console.error('❌ Error inserting visitor:', insertError);
          } else {
            console.log('✅ Visitor created successfully');
          }
        }

        hasTrackedRef.current = true;
      } catch (error) {
        console.error('❌ Tracking error:', error instanceof Error ? error.message : error);
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
