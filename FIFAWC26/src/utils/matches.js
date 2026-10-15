export function getMatchesFromResponse(response) {
  return Array.isArray(response?.data) ? response.data : [];
}

export function hasInvalidMatchData(response) {
  return Boolean(response) && !Array.isArray(response.data);
}
