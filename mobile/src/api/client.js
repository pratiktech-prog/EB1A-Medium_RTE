import axios from 'axios';
import Constants from 'expo-constants';

// On a physical device / simulator running via Expo Go, "localhost" refers to the
// device itself, not the dev machine. Expo exposes the dev machine's LAN host as
// hostUri, so we reuse that to reach the backend at the same IP, port 5000.
function resolveApiUrl() {
  const extra = Constants.expoConfig?.extra || {};
  if (extra.apiUrl && !extra.apiUrl.includes('localhost')) return extra.apiUrl;

  const hostUri = Constants.expoConfig?.hostUri || Constants.expoGoConfig?.debuggerHost;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:5000/api`;
  }
  return extra.apiUrl || 'http://localhost:5000/api';
}

const api = axios.create({ baseURL: resolveApiUrl() });

export default api;
