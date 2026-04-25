/**
 * Centralized API base URL — reads from VITE_API_URL env var.
 * In production, set this to your Render backend URL.
 * Locally it defaults to http://localhost:8000.
 */
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
