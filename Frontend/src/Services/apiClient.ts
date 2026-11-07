// Re-export the centralized apiClient from Lib
export {
  apiClient,
  getAuthToken,
  setAuthCookies,
  clearAuthCookies,
  isApiModeEnabled,
  setApiModeEnabled,
  API_MODE_STORAGE_KEY,
} from "@/Lib/apiClient";
export type { ApiResponse } from "@/Lib/apiClient";
