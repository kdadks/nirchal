/**
 * Utility functions for form data handling and validation
 */

/**
 * Converts empty strings to null for database storage
 * This ensures we don't store empty strings in the database
 */
export function sanitizeFormData<T extends Record<string, any>>(data: T): T {
  const sanitized = { ...data };
  
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      const trimmed = sanitized[key].trim();
      sanitized[key] = trimmed === '' ? null : trimmed;
    }
  }
  
  return sanitized;
}

/**
 * Converts null/undefined values to empty strings for form display
 * This ensures form fields show empty strings instead of null
 */
export function prepareFormData<T extends Record<string, any>>(data: T): T {
  const prepared = { ...data };
  
  for (const key in prepared) {
    if (prepared[key] === null || prepared[key] === undefined) {
      (prepared as any)[key] = '';
    }
  }
  
  return prepared;
}

/**
 * Sanitizes a single field value for database storage
 */
export function sanitizeField(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

/**
 * Validates that at least one field in a group has a value
 */
export function validateRequiredGroup(fields: (string | null | undefined)[]): boolean {
  return fields.some(field => field && field.trim().length > 0);
}

/**
 * Creates a sanitized address object for database operations
 */
export function sanitizeAddressData(address: any) {
  return {
    first_name: sanitizeField(address.first_name),
    last_name: sanitizeField(address.last_name),
    company: sanitizeField(address.company),
    address_line_1: sanitizeField(address.address_line_1),
    address_line_2: sanitizeField(address.address_line_2),
    city: sanitizeField(address.city),
    state: sanitizeField(address.state),
    postal_code: sanitizeField(address.postal_code),
    country: sanitizeField(address.country) || 'India', // Default to India if empty
    phone: sanitizeField(address.phone),
    is_default: Boolean(address.is_default),
    is_shipping: Boolean(address.is_shipping),
    is_billing: Boolean(address.is_billing)
  };
}

/**
 * Creates a sanitized customer object for database operations
 */
export function sanitizeCustomerData(customer: any) {
  return {
    email: sanitizeField(customer.email),
    first_name: sanitizeField(customer.first_name),
    last_name: sanitizeField(customer.last_name),
    phone: sanitizeField(customer.phone)
  };
}

/**
 * Creates a sanitized order address object for database operations
 * Ensures required fields have default values and optional fields are undefined instead of null
 */
export function sanitizeOrderAddress(address: any) {
  return {
    first_name: sanitizeField(address.first_name) || 'Guest',
    last_name: sanitizeField(address.last_name) || 'User',
    address_line_1: sanitizeField(address.address_line_1) || 'Not Provided',
    address_line_2: sanitizeField(address.address_line_2) || undefined, // Use undefined for optional fields
    city: sanitizeField(address.city) || 'Not Provided',
    state: sanitizeField(address.state) || 'Not Provided',
    postal_code: sanitizeField(address.postal_code) || '000000',
    country: sanitizeField(address.country) || 'India',
    phone: sanitizeField(address.phone) || undefined, // Use undefined for optional fields
    email: sanitizeField(address.email) || 'noreply@example.com'
  };
}
