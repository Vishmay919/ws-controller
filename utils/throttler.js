const lastSentTimestamps = new Map();

export function shouldThrottle(deviceId, type, interval = 50) {
  const key = `${deviceId}:${type}`;
  const now = Date.now();
  const last = lastSentTimestamps.get(key) || 0;

  if (now - last < interval) {
    return true; // skip for now
  }

  lastSentTimestamps.set(key, now);
  return false;
}
