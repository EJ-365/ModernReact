export function getArrayData(response) {
  return Array.isArray(response?.data) ? response.data : [];
}

export function hasInvalidArrayData(response) {
  return Boolean(response) && !Array.isArray(response.data);
}
