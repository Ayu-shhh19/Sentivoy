/**
 * Centralized API base URL.
 * Set NEXT_PUBLIC_API_URL (or the previous VITE_API_URL name) to the backend.
 * Locally it defaults to http://localhost:8000.
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
