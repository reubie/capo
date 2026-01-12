/**
 * Country/Region Detection Utility
 * Detects user's country/region for automatic phone number country code selection
 * Uses multiple methods with fallbacks for reliability
 */

/**
 * Detect country from browser locale
 * Most reliable method - no API calls needed
 * @returns {string|null} - ISO 3166-1 alpha-2 country code (e.g., 'US', 'SG', 'KR') or null
 */
const detectFromLocale = () => {
  try {
    // Method 1: Use navigator.language (e.g., 'en-US', 'ko-KR', 'zh-SG')
    const locale = navigator.language || navigator.userLanguage;
    if (locale) {
      // Extract country code from locale (e.g., 'en-US' -> 'US')
      const parts = locale.split('-');
      if (parts.length >= 2) {
        const countryCode = parts[parts.length - 1].toUpperCase();
        // Validate it's a 2-letter country code
        if (countryCode.length === 2 && /^[A-Z]{2}$/.test(countryCode)) {
          return countryCode;
        }
      }
    }

    // Method 2: Use Intl API to get locale region
    const dateTimeFormat = new Intl.DateTimeFormat();
    const resolvedOptions = dateTimeFormat.resolvedOptions();
    
    if (resolvedOptions.locale) {
      const localeParts = resolvedOptions.locale.split('-');
      if (localeParts.length >= 2) {
        const countryCode = localeParts[localeParts.length - 1].toUpperCase();
        if (countryCode.length === 2 && /^[A-Z]{2}$/.test(countryCode)) {
          return countryCode;
        }
      }
    }

    // Method 3: Use timezone to infer country (less accurate but better than nothing)
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone) {
      // Map common timezones to countries
      const timezoneToCountry = {
        'America/New_York': 'US',
        'America/Los_Angeles': 'US',
        'America/Chicago': 'US',
        'America/Denver': 'US',
        'America/Toronto': 'CA',
        'Europe/London': 'GB',
        'Europe/Paris': 'FR',
        'Europe/Berlin': 'DE',
        'Asia/Singapore': 'SG',
        'Asia/Seoul': 'KR',
        'Asia/Tokyo': 'JP',
        'Asia/Hong_Kong': 'HK',
        'Asia/Shanghai': 'CN',
        'Asia/Dubai': 'AE',
        'Australia/Sydney': 'AU',
        'Australia/Melbourne': 'AU',
        'Pacific/Auckland': 'NZ',
        'Africa/Nairobi': 'KE',
        'Africa/Johannesburg': 'ZA',
        'America/Sao_Paulo': 'BR',
        'America/Mexico_City': 'MX',
        'Asia/Kolkata': 'IN',
        'Asia/Bangkok': 'TH',
        'Asia/Kuala_Lumpur': 'MY',
        'Asia/Jakarta': 'ID',
        'Asia/Manila': 'PH',
        'Asia/Ho_Chi_Minh': 'VN',
      };
      
      if (timezoneToCountry[timezone]) {
        return timezoneToCountry[timezone];
      }
    }
  } catch (error) {
    console.warn('Error detecting country from locale:', error);
  }
  
  return null;
};

/**
 * Detect country from IP address using a free geolocation service
 * Fallback method when locale detection fails
 * @returns {Promise<string|null>} - ISO 3166-1 alpha-2 country code or null
 */
const detectFromIP = async () => {
  try {
    // Use ipapi.co (free tier: 1000 requests/day, no API key needed)
    // Alternative: ip-api.com, ipgeolocation.io
    
    // Create abort controller for timeout (fallback for browsers without AbortSignal.timeout)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    if (data.country_code && data.country_code.length === 2) {
      return data.country_code.toUpperCase();
    }
  } catch (error) {
    // Silently fail - this is a fallback method
    // Don't log timeout errors as they're expected
    if (error.name !== 'AbortError') {
      console.warn('IP-based country detection failed (this is okay):', error.message);
    }
  }
  
  return null;
};

/**
 * Main function to detect user's country
 * Prioritizes IP-based detection for accurate location-based country detection
 * Falls back to locale detection if IP detection fails
 * @param {boolean} prioritizeIP - Whether to prioritize IP detection (default: true)
 * @returns {Promise<string>} - ISO 3166-1 alpha-2 country code, defaults to 'US' if all methods fail
 */
export const detectUserCountry = async (prioritizeIP = true) => {
  // If prioritizing IP, try IP detection first (most accurate for location-based detection)
  if (prioritizeIP) {
    try {
      const ipCountry = await detectFromIP();
      if (ipCountry) {
        console.log('🌍 Country detected from IP (location-based):', ipCountry);
        return ipCountry;
      }
    } catch (error) {
      console.warn('IP-based country detection failed, falling back to locale:', error.message);
    }
  }

  // Fallback to locale detection (synchronous, fast, no API call)
  const localeCountry = detectFromLocale();
  if (localeCountry) {
    console.log('🌍 Country detected from locale (fallback):', localeCountry);
    return localeCountry;
  }

  // Default fallback
  console.log('🌍 Country detection failed, using default: US');
  return 'US';
};

/**
 * Get country code synchronously (locale only, no async)
 * Useful when you need immediate detection without waiting for IP API
 * @returns {string} - ISO 3166-1 alpha-2 country code, defaults to 'US'
 */
export const detectUserCountrySync = () => {
  const localeCountry = detectFromLocale();
  return localeCountry || 'US';
};

