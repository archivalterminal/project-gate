export function getOrCreateDeviceId(): string {
  const key = "project-gate-device-id";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;

  const created = crypto.randomUUID();
  window.localStorage.setItem(key, created);
  return created;
}
