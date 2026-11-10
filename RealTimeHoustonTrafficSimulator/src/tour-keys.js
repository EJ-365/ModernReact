/** Focus is in a text control (music search, place search, a HUD <select>, …). */
export function tourKeyFromField(target) {
  const tag = target && target.tagName;
  return typeof tag === 'string' && /^(INPUT|SELECT|TEXTAREA)$/.test(tag);
}

/**
 * What the tour keydown listener should do.
 * 'field' — the focused control owns the key (Escape closes song search, it must not end the drive).
 * 'exit' — Escape with nothing else focused ends the tour.
 * 'ignore' — no tour is running.
 * 'pass' — handle driving keys.
 */
export function tourEscapeAction(e, active) {
  if (!active) return 'ignore';
  if (tourKeyFromField(e && e.target)) return 'field';
  if (e && e.key === 'Escape') return 'exit';
  return 'pass';
}
