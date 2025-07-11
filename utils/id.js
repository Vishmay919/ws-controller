export function generatePairingCode(length = 6) {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(min + Math.random() * (max - min)).toString();
}

export function generateDeviceId() {
  return Math.random().toString(36).substring(2, 10);
}

