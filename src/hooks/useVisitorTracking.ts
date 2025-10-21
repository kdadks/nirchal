import { useEffect, useRef, useState } from 'react';
import { supabase } from '../config/supabase';

interface VisitorInfo {
  visitor_id: string;
  browser: string;
  os: string;
  device_type: string;
  screen_resolution: string;
  referrer: string;
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

export const useVisitorTracking = () => {
  const visitorIdRef = useRef<string | null>(null);
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const sessionStartRef = useRef<number>(Date.now());
  const pageViewsRef = useRef<number>(0);
  const hasTrackedRef = useRef<boolean>(false);

  useEffect(() => {
    // Get or create visitor ID
    visitorIdRef.current = getVisitorId();
    setVisitorId(visitorIdRef.current); // Set state to trigger re-render

    // Gather visitor info
    const visitorInfo: VisitorInfo = {
      visitor_id: visitorIdRef.current,
      browser: detectBrowser(),
      os: detectOS(),
      device_type: detectDeviceType(),
      screen_resolution: getScreenResolution(),
      referrer: getReferrer()
    };

    // Track initial visit
    const trackVisit = async () => {
      if (hasTrackedRef.current) return;

      try {
        // Check if visitor exists
        const { data: existingVisitor, error: fetchError } = await supabase
          .from('guest_visitors')
          .select('id, pages_visited, time_spent, visit_count')
          .eq('visitor_id', visitorInfo.visitor_id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          // PGRST116 means "not found", which is expected for new visitors
          // Table might not exist yet - that's okay, continue anyway
          hasTrackedRef.current = true;
          return;
        }

        if (existingVisitor) {
          // Update existing visitor
          await supabase
            .from('guest_visitors')
            .update({
              last_visit: new Date().toISOString(),
              pages_visited: (Number(existingVisitor.pages_visited) || 0) + 1,
              visit_count: (Number(existingVisitor.visit_count) || 0) + 1,
              browser: visitorInfo.browser,
              os: visitorInfo.os,
              device_type: visitorInfo.device_type,
              screen_resolution: visitorInfo.screen_resolution
            })
            .eq('visitor_id', visitorInfo.visitor_id);
        } else {
          // Create new visitor
          const { error: insertError } = await supabase
            .from('guest_visitors')
            .insert({
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
            });

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

    trackVisit();

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
