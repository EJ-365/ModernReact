/**
 * Searchable filter for long <select> place lists (right panel).
 * Keeps the native select value so existing Start/Plan handlers keep working.
 */
export function attachPlaceSearch(sel, opts = {}) {
  if (!sel || sel.dataset.placeSearch === '1') return;
  sel.dataset.placeSearch = '1';
  const wrap = document.createElement('div');
  wrap.className = 'placePick';
  sel.parentNode.insertBefore(wrap, sel);
  wrap.appendChild(sel);
  sel.classList.add('placePick-sel');
  if (!sel.getAttribute('size')) sel.setAttribute('size', String(opts.size || 8));

  const inp = document.createElement('input');
  inp.type = 'search';
  inp.className = 'placePick-q';
  inp.placeholder = opts.placeholder || 'Search places…';
  inp.setAttribute('autocomplete', 'off');
  inp.setAttribute('aria-label', opts.ariaLabel || 'Search places');
  wrap.insertBefore(inp, sel);

  const apply = () => {
    const q = inp.value.trim().toLowerCase();
    for (const opt of sel.options) {
      if (!opt.value) {
        opt.hidden = !!q;
        continue;
      }
      const label = (opt.textContent || '').toLowerCase();
      opt.hidden = !!(q && !label.includes(q));
    }
    for (const g of sel.querySelectorAll('optgroup')) {
      let any = false;
      for (const o of g.querySelectorAll('option')) {
        if (!o.hidden) { any = true; break; }
      }
      g.hidden = !any;
    }
  };
  inp.addEventListener('input', apply);
  inp.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      inp.value = '';
      apply();
      inp.blur();
    }
  });

  if (!document.getElementById('placePickCss')) {
    const css = document.createElement('style');
    css.id = 'placePickCss';
    css.textContent = '.placePick{display:flex;flex-direction:column;gap:6px;margin:6px 0 4px}'
      + '.placePick-q{width:100%;box-sizing:border-box;background:#241c16;border:1px solid rgba(224,122,46,.35);'
      + 'color:#f3ebe0;font:600 12.5px Overpass,system-ui,sans-serif;padding:9px 10px;border-radius:9px}'
      + '.placePick-q::placeholder{color:#8a7e70}'
      + '.placePick-q:focus{outline:none;border-color:rgba(232,168,56,.7);box-shadow:0 0 0 2px rgba(232,168,56,.15)}'
      + 'select.placePick-sel{max-height:min(220px,32vh);overflow:auto;margin-bottom:0}'
      + 'select.placePick-sel option:checked,select.placePick-sel option:hover{background:#e8a838;color:#1a1008}';
    document.head.appendChild(css);
  }
}
