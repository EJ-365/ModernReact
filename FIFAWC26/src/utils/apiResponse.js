export function getDataArray(response) {
  return Array.isArray(response?.data) ? response.data : [];
}

export function getErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}
