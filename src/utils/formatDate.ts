/**
 * Formats a date string or Date object to DD-MMM-YYYY format
 * @param date - Date string or Date object
 * @returns Formatted date string in DD-MMM-YYYY format
 */
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
  const year = dateObj.getFullYear();
  
  return `${day}-${month}-${year}`;
};

/**
 * Formats a date for display in the user dashboard
 * @param date - Date string or Date object
 * @returns Formatted date string in DD-MMM-YYYY format
 */
export const formatDisplayDate = (date: string | Date): string => {
  return formatDate(date);
};
