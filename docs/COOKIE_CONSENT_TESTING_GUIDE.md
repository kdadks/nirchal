# Cookie Consent Manager - Testing Guide

## Quick Testing on Localhost

### Option 1: Using URL Parameter (Easiest)
Simply append `?resetCookies=true` to any page URL:

```
http://localhost:5173/?resetCookies=true
```

This will:
- Clear the stored consent data from localStorage
- Force show the cookie consent banner
- Allow you to test the banner and all interactions

### Option 2: Using Browser Console

Open browser console (F12) and use these commands:

```javascript
// Reset consent and show banner
nirchalCookieConsent.reset()
// Then refresh the page - banner will appear

// Get current preferences
nirchalCookieConsent.getPreferences()

// Accept all cookies
nirchalCookieConsent.acceptAll()

// Reject all non-essential cookies  
nirchalCookieConsent.rejectAll()

// Show banner again
nirchalCookieConsent.show()
```

### Option 3: Manual localStorage Clearing

1. Open browser DevTools (F12)
2. Go to **Application** tab
3. Click **Local Storage** 
4. Find `nirchal_cookie_consent` key
5. Delete it
6. Refresh the page - banner will appear

## Testing Checklist

### Basic Banner Display
- [ ] Banner appears at bottom of page on first visit
- [ ] Banner is sticky (stays visible while scrolling)
- [ ] Banner has proper styling (white background, shadow)
- [ ] All text is readable

### Simple Mode (Default View)
- [ ] Title "🍪 We use cookies" is visible
- [ ] Description text explains cookie usage
- [ ] "Cookie policy" link is blue and underlined
- [ ] Four buttons are visible: "Reject All", "Customize", "Accept All", Close (X)

### Button Interactions
- [ ] All buttons show hand cursor on hover
- [ ] "Reject All" button is gray/neutral color
- [ ] "Customize" button is gray with settings icon
- [ ] "Accept All" button is blue
- [ ] Close (X) button is small and in top right

### Customize/Detailed Mode
- [ ] Clicking "Customize" or "cookie policy" opens detailed view
- [ ] Backdrop appears (semi-transparent dark overlay)
- [ ] Title changes to "🍪 Cookie Preferences"
- [ ] Four cookie categories are shown as cards:
  - Essential (disabled checkbox, "Always enabled")
  - Analytics (toggleable checkbox)
  - Marketing (toggleable checkbox)
  - Performance (toggleable checkbox)

### Detailed Mode - Card Interactions
- [ ] Each card shows a description of what that category does
- [ ] Cards have hover effect (border color change + shadow)
- [ ] Cards are clickable anywhere to toggle checkbox
- [ ] Checkboxes show proper state (checked/unchecked)
- [ ] Essential category checkbox is disabled (grayed out)

### Checkbox Behavior
- [ ] Clicking checkbox toggles the state
- [ ] Clicking anywhere on the card toggles the checkbox
- [ ] Essential checkbox cannot be toggled
- [ ] State persists while banner is open

### Action Buttons (Detailed Mode)
- [ ] "Reject All" button - all unselect except Essential
- [ ] "Save Preferences" button - saves custom selection
- [ ] "Accept All" button - all selected
- [ ] All buttons show hand cursor

### Closing Banner
- [ ] Clicking X button closes the banner
- [ ] Clicking "Accept All" closes the banner
- [ ] Clicking "Reject All" closes the banner
- [ ] Clicking "Save Preferences" closes the banner
- [ ] Clicking backdrop closes the banner
- [ ] Preferences are saved after closing

### Consent Persistence
- [ ] After closing banner, it doesn't reappear on page reload
- [ ] After closing banner, it doesn't appear on new pages
- [ ] Consent stays active for 365 days (can verify in console)
- [ ] Using `?resetCookies=true` shows banner again

### Analytics Integration
- [ ] GA4 doesn't load if Analytics not consented
- [ ] GA4 loads if Analytics is consented
- [ ] Facebook Pixel doesn't load if Marketing not consented
- [ ] Facebook Pixel loads if Marketing is consented

### Responsive Design
- [ ] Banner looks good on mobile (< 640px width)
- [ ] Banner looks good on tablet (640-1024px)
- [ ] Banner looks good on desktop (> 1024px)
- [ ] Buttons stack vertically on mobile
- [ ] Buttons are side-by-side on desktop

### Accessibility
- [ ] Banner is keyboard navigable (Tab key)
- [ ] Buttons can be activated with Enter/Space
- [ ] Close button has aria-label
- [ ] Color contrast meets WCAG standards

## Console Output Expected

When page loads, you should see in console:

```
[Cookie Consent] Manager initialized
[Cookie Consent] Development helpers available at window.nirchalCookieConsent
[Cookie Consent Banner] Checking visibility: {...}
```

On first visit:
```
[Cookie Consent Banner] Banner not shown - consent already given
OR
[Cookie Consent Banner] Banner should show - no consent yet
```

## Debugging

### Banner not showing even with ?resetCookies=true

1. Check console for errors - look for any red errors
2. Verify localStorage is enabled in browser
3. Check that `isVisible` state is true (add console.log)
4. Try manual localStorage clear from DevTools

### Clicking not working

1. Verify `cursor: pointer` class is applied (inspect element)
2. Check z-index of elements in DevTools
3. Look for CSS `pointer-events: none` blocking clicks
4. Verify no parent container is intercepting clicks

### Preferences not saving

1. Check localStorage quota not exceeded
2. Verify save handler is called (add console.log)
3. Check for console errors
4. Try refreshing with F5 (hard refresh)

### Banner appears but no animations

1. Tailwind CSS may not be compiling
2. Check CSS classes are in generated file
3. Run `npm run build` to regenerate CSS

## Testing with Different Browsers

- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)

## Performance Testing

Check Network tab in DevTools:

- [ ] Banner component < 50KB
- [ ] Manager utility < 30KB
- [ ] No unnecessary API calls
- [ ] Lazy loads only needed modules

## Automated Testing (Future)

When ready to add automated tests:

```javascript
// Example Cypress test
describe('Cookie Consent Banner', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/?resetCookies=true');
  });

  it('should display banner on first visit', () => {
    cy.get('[class*="fixed"]').should('be.visible');
    cy.contains('We use cookies').should('be.visible');
  });

  it('should toggle Analytics checkbox', () => {
    cy.contains('Customize').click();
    cy.contains('Analytics').click();
    // Verify checkbox is toggled
  });

  it('should save preferences', () => {
    cy.contains('Customize').click();
    cy.contains('Save Preferences').click();
    cy.reload();
    // Verify banner doesn't reappear
  });
});
```

## Notes for QA/Testing Team

- **Production vs Development**: Banner always shows on first visit or when `?resetCookies=true` is added
- **Console Warnings**: Expected logs with `[Cookie Consent]` prefix are normal
- **localStorage Size**: Consent data is ~500 bytes, well under limits
- **No External Dependencies**: Uses only js-cookie library (lightweight)
- **GDPR Compliant**: Explicit opt-in required before any tracking

## Getting Help

If banner doesn't work:

1. Check browser console (F12 > Console tab) for errors
2. Check localStorage for `nirchal_cookie_consent` key
3. Try hard refresh (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac)
4. Try incognito/private browsing mode
5. Clear all site data and try again

For more info, see: `/docs/COOKIE_CONSENT_MANAGEMENT_GUIDE.md`
