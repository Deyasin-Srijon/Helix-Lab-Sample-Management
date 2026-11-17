/**
 * FILE: src/config/adminConfig.js
 *
 * PURPOSE:
 * Holds static configuration constants and application metadata for the administrator portal.
 *
 * RESPONSIBILITIES:
 * - Defines the user-facing application brand name (`APP_NAME`).
 *
 * ARCHITECTURAL LAYER:
 * Configuration Layer.
 *
 * DATA FLOW:
 * - `APP_NAME`: Consumed by `Navbar.jsx` and `AdminLoginPage.jsx` for branding display.
 *
 * DEPENDENCIES / IMPORTS:
 * - None (pure JavaScript configuration object).
 *
 * CONSUMED BY:
 * - `src/components/Navbar.jsx` (branding header).
 * - `src/pages/AdminLoginPage.jsx` (login dialog title).
 *
 * EXPORTS:
 * - `APP_NAME`: Application brand display string.
 */

/**
 * Human-readable application title displayed in headers and login forms.
 */
export const APP_NAME = 'Helix Lab Sample Management';
