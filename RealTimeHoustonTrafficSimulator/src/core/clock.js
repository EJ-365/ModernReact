/**
 * Timezone clock helpers (America/Chicago for Houston).
 * Pure parts — app.html still owns liveMode / simH / weekend mutation.
 */

/**
 * @param {Date} d
 * @param {string} [timeZone]
 */
export function chicagoParts(d, timeZone = 'America/Chicago') {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
    weekday: 'short',
  }).formatToParts(d);
}

/**
 * @param {Intl.DateTimeFormatPart[]} p
 */
export function partsToHourWeekend(p) {
  const g = (k) => {
    const f = p.find((x) => x.type === k);
    return f ? f.value : '0';
  };
  const wd = g('weekday');
  return {
    h: (+g('hour') % 24) + (+g('minute')) / 60 + (+g('second')) / 3600,
    we: wd === 'Sat' || wd === 'Sun',
  };
}

/**
 * Cached local-hour clock for a timezone.
 * @param {{ timeZone?: string, isLive?: () => boolean, onWeekend?: (we: boolean) => void }} [opts]
 */
export function createCityClock(opts = {}) {
  const timeZone = opts.timeZone || 'America/Chicago';
  let cache = { at: 0, h: 12, weekend: false };

  function now(force) {
    const t = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (!force && cache.at && t - cache.at < 450) {
      return (cache.h + (t - cache.at) / 1000 / 3600) % 24;
    }
    try {
      const r = partsToHourWeekend(chicagoParts(new Date(), timeZone));
      cache = { at: t, h: r.h, weekend: r.we };
      if (opts.isLive && opts.isLive() && opts.onWeekend) opts.onWeekend(r.we);
      return r.h;
    } catch {
      const d = new Date();
      const we = d.getDay() === 0 || d.getDay() === 6;
      const h = d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
      cache = { at: t, h, weekend: we };
      if (opts.isLive && opts.isLive() && opts.onWeekend) opts.onWeekend(we);
      return h;
    }
  }

  /**
   * @param {number} [simOffsetSec]
   * @param {boolean} [live]
   */
  function syncCalendar(simOffsetSec = 0, live = true) {
    try {
      const d = live ? new Date() : new Date(Date.now() + simOffsetSec * 1000);
      const r = partsToHourWeekend(chicagoParts(d, timeZone));
      if (opts.onWeekend) opts.onWeekend(r.we);
      return r;
    } catch {
      const d = live ? new Date() : new Date(Date.now() + simOffsetSec * 1000);
      const we = d.getDay() === 0 || d.getDay() === 6;
      if (opts.onWeekend) opts.onWeekend(we);
      return { h: null, we };
    }
  }

  return {
    timeZone,
    now,
    syncCalendar,
    chicagoParts: (d) => chicagoParts(d, timeZone),
    partsToHourWeekend,
  };
}
