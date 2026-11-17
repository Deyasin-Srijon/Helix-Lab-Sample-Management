/**
 * FILE: src/main.jsx
 *
 * PURPOSE:
 * This is the application entry point for the React client. It is responsible for
 * bootstrapping the React runtime, attaching the top-level React component tree
 * to the physical browser DOM (Document Object Model), and applying global styles.
 *
 * RESPONSIBILITIES:
 * - Locates the single HTML host container (`<div id="root"></div>`) rendered by `index.html`.
 * - Creates a modern React 18 Concurrent Mode root using `createRoot`.
 * - Wraps the application inside `<StrictMode>` to assist developers during development.
 * - Imports global Tailwind CSS v4 stylesheets and typography rules via `index.css`.
 * - Renders the root `<App />` component.
 *
 * ARCHITECTURAL LAYER:
 * Presentation Layer / Application Bootstrapper (Client Entry Point).
 *
 * DATA FLOW & STARTUP SEQUENCE:
 * 1. The browser requests `index.html`.
 * 2. The HTML file requests this JavaScript module (`main.jsx`).
 * 3. The browser executes `createRoot(document.getElementById('root'))`.
 * 4. React mounts `<App />`, initiating Context Providers and the React Router route tree.
 *
 * DEPENDENCIES / IMPORTS:
 * - `react` (`StrictMode`): A developer tool for highlighting potential problems in code.
 * - `react-dom/client` (`createRoot`): React 18's root API for client-side rendering.
 * - `./App.jsx` (`App`): The top-level component defining routing and context providers.
 * - `./index.css`: Global application stylesheet containing font definitions and Tailwind CSS directives.
 *
 * CONSUMED BY:
 * - Vite dev server and build tools (the initial script tag in the root `index.html`).
 *
 * EXPORTS:
 * - None (this is an execution entry script).
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

/**
 * Mount the React root element to the DOM node with id 'root'.
 *
 * WHY <StrictMode> IS USED:
 * - StrictMode does not render any visible UI in production.
 * - In development mode, it activates extra checks and warnings for child components:
 *   1. It intentionality double-invokes effects (mount -> unmount -> remount) to uncover
 *      missing cleanup logic in `useEffect`.
 *   2. It verifies that components are pure functions by double-invoking render phases.
 *   3. It warns about deprecated lifecycle methods and APIs.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
