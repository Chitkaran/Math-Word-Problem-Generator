
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxHbNLsGMTmYOArWm7iRsCmABg_dCOMxEu4F64Ed3vW6tpYMb5QdIRqYEXkPWtkF5p8/exec';

export interface TrackingData {
  event: 'login' | 'generate';
  email?: string | null;
  name?: string | null;
  userId?: string;
  topic?: string;
  gradeLevel?: string;
  questionCount?: number;
  ipAddress?: string;
}

const getUserIP = async (): Promise<string | undefined> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.warn('Could not fetch IP address:', error);
    return undefined;
  }
};

export const trackEvent = async (data: TrackingData) => {
  try {
    const ipAddress = await getUserIP();
    
    const payload = {
      ...data,
      ipAddress,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('Tracking Event:', payload);
    }

    // We use text/plain to avoid CORS preflight (OPTIONS request) 
    // which Google Apps Script doesn't always handle well by default.
    // The Apps Script doGet/doPost can still parse the body.
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    // Silent fail for tracking
    console.warn('Tracking sync failed:', error);
  }
};
