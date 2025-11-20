// Integration Guide for International Address Selector

/**
 * CHECKOUT PAGE CHANGES
 * 
 * 1. Add to form state (line ~30-40):
 * 
 * interface DeliveryFormData {
 *   // ... existing fields
 *   deliveryCountry: string;  // NEW
 *   deliveryState: string;    // NEW
 *   deliveryCity: string;     // NEW (replaces the old deliveryAddress for international)
 *   deliveryAddress: string;  // Keep but use for street address
 * }
 * 
 * 2. Initialize in form state (line ~90):
 * 
 * const [form, setForm] = useState<DeliveryFormData>({
 *   // ... existing
 *   deliveryCountry: 'IN',
 *   deliveryState: '',
 *   deliveryCity: '',
 *   // ...
 * });
 * 
 * 3. Add import at top:
 * import InternationalAddressSelector from '../components/common/InternationalAddressSelector';
 * 
 * 4. Add to JSX (in the form section where delivery address is):
 * 
 * {isInternational && (
 *   <InternationalAddressSelector
 *     country={form.deliveryCountry}
 *     state={form.deliveryState}
 *     city={form.deliveryCity}
 *     onCountryChange={(country) => setForm(prev => ({ ...prev, deliveryCountry: country }))}
 *     onStateChange={(state) => setForm(prev => ({ ...prev, deliveryState: state }))}
 *     onCityChange={(city) => setForm(prev => ({ ...prev, deliveryCity: city }))}
 *     required
 *   />
 * )}
 * 
 * 5. Update when saving address to database:
 *    - Extract city name from deliveryCity field (remove __CUSTOM__ prefix if exists)
 *    - Save country, state, city separately or in address fields
 * 
 * 
 * ACCOUNT PAGE CHANGES
 * 
 * Similar integration in address management form:
 * 1. Add country, state, city to address state
 * 2. Import InternationalAddressSelector
 * 3. Show selector for international users
 * 4. Update save logic to handle country/state/city
 * 
 * 
 * DATABASE/STORAGE CONSIDERATIONS
 * 
 * The address fields can store:
 * - address_line_1: Street address
 * - address_line_2: Apartment/Suite (optional)
 * - Can add new fields:
 *   - country_code: 'IN', 'US', 'GB', etc.
 *   - state_code: 'MH', 'CA', 'ENG', etc.
 *   - city: 'Mumbai', 'Los Angeles', 'London', etc.
 * 
 * OR use combined format:
 * - address_line_1: "Street Address"
 * - address_line_2: "City, State, Country" (comma-separated)
 */
