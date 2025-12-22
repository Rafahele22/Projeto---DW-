# JavaScript Structure Overview

This document describes the organization and main responsibilities of all JavaScript code in the Fontscope project, including both the server-side (Node.js) and client-side (public) code.

---

## 1. Server-side JavaScript (`server/`)

### Main files and folders:
- **server/server.js**
  - Entry point for the Node.js backend server
  - Handles API routes, static file serving, and connection to MongoDB
  - Manages authentication, user sessions, and data requests
- **server/config/db.js**
  - MongoDB connection configuration
  - Exports database connection logic for use in the server
- **server/routes/** (if present)
  - Contains route handlers for API endpoints (e.g., collections, users, fonts)
- **server/utils/** (if present)
  - Utility functions for data processing, asset management, and routing

### Responsibilities:
- Serve API endpoints for fonts, collections, users, authentication, etc.
- Connect to and query MongoDB
- Handle user login, registration, and session management
- Serve static assets to the frontend
- Provide data for filtering, searching, and user collections

---

## 2. Client-side JavaScript (`public/js/`)

### Main folders:
- **public/js/main/**
  - Core application logic and entrypoint
  - Handles state management, filtering, search, and UI interactions
- **public/js/main/react/**
  - React components for collections, filters, and UI views
  - Modularized into hooks, items, views, and mount scripts
- **public/js/main/views/**
  - Non-React view logic (grid, list, single font view)
- **public/js/main/shared/**
  - Shared utility functions (display, font, grid)
- **public/js/main/index.js**
  - Main entrypoint for initializing the app, loading data, and mounting UI
- **public/js/main/filtering.js**
  - Filtering logic for fonts and collections
- **public/js/main/fontsApi.js**
  - API calls for fetching font data
- **public/js/main/state.js**
  - State management for fonts, collections, and user preferences
- **public/js/main/viewMode.js**
  - Logic for toggling between grid and list views
- **public/js/main/htmlGenerator.js**
  - Generates main HTML structure for the app

### React structure (`public/js/main/react/collections/`):
- **hooks.jsx**: Custom hooks and utility functions for collections
- **items.jsx**: UI components for individual font items, save/favorite buttons
- **views.jsx**: Layout components for albums, lists, grids, and pairs
- **collectionsApp.mount.jsx**: Mounts the React collections UI into the app
- **collectionsApp.utils.jsx**: Utility functions for font face and caps lock tracking

### Responsibilities:
- Fetch and display font data from the server
- Provide filtering, searching, and lazy loading of fonts
- Render UI components for collections, albums, pairs, and favorites
- Manage user interactions, state, and preferences
- Support both grid and list viewing modes
- Handle authentication and user profile features
- Integrate with Electron for desktop app functionality

---

## 3. Other folders
- **public/assets/**: Fonts, images, and other static assets
- **data/**: Font database and collections (used by server and client)
- **electron/**: Electron app entrypoint and configuration
- **C-react/**: Experimental React code and conversion scripts

---

## Summary
- All server-side JS is in `server/` and handles backend logic, API, and database.
- All client-side JS is in `public/js/` and manages UI, state, React components, and user interactions.
- The project is modular, with clear separation between backend, frontend, shared utilities, and assets.
