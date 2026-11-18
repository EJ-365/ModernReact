/**
 * Pack 3 (one-shot archive). Innertube search removed — never hardcode API keys.
 * Prefer scripts that only use oEmbed + explicit video IDs (no secrets).
 * If you need search later: set YOUTUBE_INNERTUBE_KEY in .env.local (gitignored) and do not commit it.
 */
const fs = require('fs');
const path = require('path');
console.log('expand-tracks-3 is retired (API key scrubbed). Use a key-free add-songs script instead.');
process.exit(0);
