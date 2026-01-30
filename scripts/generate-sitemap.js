#!/usr/bin/env node

/**
 * Sitemap Generator
 * 
 * Generates a sitemap.xml file for the React app by:
 * 1. Reading the base URL from VITE_SITE_URL environment variable
 * 2. Extracting routes from App.jsx or using a fallback routes list
 * 3. Generating a standard XML sitemap
 * 
 * Usage: node scripts/generate-sitemap.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

/**
 * Extract routes from App.jsx by parsing the file
 * Falls back to a predefined routes list if parsing fails
 */
function getRoutes() {
  const appJsxPath = join(rootDir, 'src', 'App.jsx');
  
  try {
    const appContent = readFileSync(appJsxPath, 'utf-8');
    const routes = [];
    
    // Extract route paths using regex
    // Matches: <Route path="/path" ... />
    const routeRegex = /<Route\s+path=["']([^"']+)["']/g;
    let match;
    
    while ((match = routeRegex.exec(appContent)) !== null) {
      const path = match[1];
      // Only include public routes in sitemap (exclude protected routes that require auth)
      // You can customize this logic based on your needs
      if (path !== '/profile' && path !== '/gifticon' && path !== '/network') {
        routes.push(path);
      }
      // Or include all routes:
      // routes.push(path);
    }
    
    if (routes.length > 0) {
      console.log(`✓ Extracted ${routes.length} routes from App.jsx`);
      return routes;
    }
  } catch (error) {
    console.warn(`⚠ Could not parse App.jsx: ${error.message}`);
  }
  
  // Fallback: predefined routes list
  // Update this list if you add new public routes
  const fallbackRoutes = [
    '/',
    '/login',
    '/register',
  ];
  
  console.log(`✓ Using fallback routes list (${fallbackRoutes.length} routes)`);
  return fallbackRoutes;
}

/**
 * Generate XML sitemap content
 */
function generateSitemap(baseUrl, routes) {
  // Ensure baseUrl doesn't end with a slash
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  
  // Get current date in ISO format (YYYY-MM-DD)
  const lastmod = new Date().toISOString().split('T')[0];
  
  // Generate URL entries
  const urlEntries = routes.map(route => {
    const fullUrl = `${cleanBaseUrl}${route === '/' ? '' : route}`;
    return `    <url>
      <loc>${escapeXml(fullUrl)}</loc>
      <lastmod>${lastmod}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>${route === '/' ? '1.0' : '0.8'}</priority>
    </url>`;
  }).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

/**
 * Escape XML special characters
 */
function escapeXml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Main function
 */
function main() {
  // Base URL: explicit env var first, then Vercel's VERCEL_URL (set automatically on Vercel)
  let baseUrl = process.env.VITE_SITE_URL || process.env.REACT_APP_SITE_URL;
  if (!baseUrl && process.env.VERCEL_URL) {
    baseUrl = `https://${process.env.VERCEL_URL}`;
    console.log(`ℹ Using VERCEL_URL for sitemap: ${baseUrl} (set VITE_SITE_URL for a custom domain)`);
  }

  if (!baseUrl) {
    console.error('❌ Error: VITE_SITE_URL or REACT_APP_SITE_URL environment variable is not set');
    console.error('   On Vercel, VERCEL_URL is used automatically. Locally, set VITE_SITE_URL in .env');
    console.error('   Example: VITE_SITE_URL=https://yourdomain.com');
    process.exit(1);
  }

  // Ensure URL has protocol for validation
  if (!/^https?:\/\//i.test(baseUrl)) {
    baseUrl = `https://${baseUrl}`;
  }

  // Validate URL format
  try {
    new URL(baseUrl);
  } catch (error) {
    console.error(`❌ Error: Invalid URL format: ${baseUrl}`);
    console.error('   Please provide a valid URL (e.g., https://yourdomain.com)');
    process.exit(1);
  }
  
  console.log(`📝 Generating sitemap for: ${baseUrl}`);
  
  // Get routes
  const routes = getRoutes();
  
  if (routes.length === 0) {
    console.error('❌ Error: No routes found');
    process.exit(1);
  }
  
  // Generate sitemap XML
  const sitemapXml = generateSitemap(baseUrl, routes);
  
  // Write to public/sitemap.xml
  const sitemapPath = join(rootDir, 'public', 'sitemap.xml');
  writeFileSync(sitemapPath, sitemapXml, 'utf-8');
  
  console.log(`✓ Sitemap generated successfully: ${sitemapPath}`);
  console.log(`  - ${routes.length} URLs included`);
  console.log(`  - Base URL: ${baseUrl}`);
  
  // Generate robots.txt with sitemap reference
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  const robotsTxt = `# robots.txt
# This file tells search engines which pages they can and cannot access

User-agent: *
Allow: /

# Sitemap location
Sitemap: ${cleanBaseUrl}/sitemap.xml
`;
  
  const robotsPath = join(rootDir, 'public', 'robots.txt');
  writeFileSync(robotsPath, robotsTxt, 'utf-8');
  
  console.log(`✓ robots.txt generated successfully: ${robotsPath}`);
}

// Run the script
main();
