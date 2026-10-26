export function getPayloadArray(payload) {
  return Array.isArray(payload?.data) ? payload.data : [];
}
