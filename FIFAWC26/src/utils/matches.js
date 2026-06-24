export function selectUpcomingMatches(payload, limit = 4) {
  const matches = Array.isArray(payload?.data) ? payload.data : [];

  return matches
    .filter((match) => match && match.status !== "FINISHED")
    .sort((a, b) => {
      const aTime = Date.parse(a.datetime_utc);
      const bTime = Date.parse(b.datetime_utc);

      if (Number.isNaN(aTime) && Number.isNaN(bTime)) {
        return (a.num ?? 0) - (b.num ?? 0);
      }

      if (Number.isNaN(aTime)) return 1;
      if (Number.isNaN(bTime)) return -1;

      return aTime - bTime;
    })
    .slice(0, limit);
}

export function formatMatchScore(match) {
  if (match.score_home != null && match.score_away != null) {
    return `${match.score_home}:${match.score_away}`;
  }

  return match.time_utc ? `${match.time_utc} UTC` : "TBD";
}
