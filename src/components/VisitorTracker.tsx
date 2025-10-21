import React from 'react';
import { useVisitorTracking } from '../hooks/useVisitorTracking';

interface VisitorTrackerProps {
  children: React.ReactNode;
}

const VisitorTracker: React.FC<VisitorTrackerProps> = ({ children }) => {
  useVisitorTracking(); // Just track, don't show dialog

  return <>{children}</>;
};

export default VisitorTracker;
