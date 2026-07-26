import posthog from 'posthog-js';

const env = typeof import.meta !== 'undefined' ? (import.meta as any).env : {};
const posthogKey = env?.VITE_POSTHOG_KEY;
const posthogHost = env?.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

let isInitialized = false;

if (posthogKey) {
  posthog.init(posthogKey, {
    api_host: posthogHost,
    autocapture: false,
    capture_pageview: false,
    persistence: 'localStorage',
    ip: false, // DPA compliance
  });
  isInitialized = true;
}

export const analytics = {
  track: (eventName: string, properties?: Record<string, any>) => {
    if (isInitialized) {
      posthog.capture(eventName, properties);
    } else {
      // Silent no-op when not configured
    }
  },
  identify: (userId: string, userProperties?: Record<string, any>) => {
    if (isInitialized) {
      posthog.identify(userId, userProperties);
    }
  },
  reset: () => {
    if (isInitialized) {
      posthog.reset();
    }
  },
};
