import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRssItems, pullTranStarPublicFeeds } from '../src/feeds/transtar-rss.js';
import { transtarAdapter } from '../src/feeds/transtar.js';
import { houstonManifest } from '../src/cities/houston/manifest.js';

const SAMPLE = `<?xml version="1.0"?>
<rss><channel>
<item>
  <title>IH-45 North Southbound from SH-242 to Downtown</title>
  <description>Travel Time: 34 min</description>
  <guid>tt-1</guid>
  <pubDate>Sat, 11 Jul 2026 12:00:00 GMT</pubDate>
</item>
<item>
  <title><![CDATA[Lane closure on US-59]]></title>
  <description><![CDATA[Status: Active]]></description>
  <guid>cl-2</guid>
</item>
</channel></rss>`;

test('parseRssItems extracts titles and times', () => {
  const items = parseRssItems(SAMPLE);
  assert.equal(items.length, 2);
  assert.equal(items[0].title, 'IH-45 North Southbound from SH-242 to Downtown');
  assert.match(items[0].desc, /34 min/);
  assert.equal(items[1].title, 'Lane closure on US-59');
  assert.equal(items[0].guid, 'tt-1');
});

test('adapter refresh returns RSS-shaped snapshot (mocked fetch)', async () => {
  const xml = SAMPLE;
  const fakeFetch = async () => ({
    ok: true,
    status: 200,
    text: async () => xml,
    headers: { get: () => 'application/xml' },
  });
  const snap = await transtarAdapter.refresh(houstonManifest, {
    fetchWithTimeout: fakeFetch,
  });
  assert.equal(snap.ok, true);
  assert.equal(snap.src, 'transtar-rss');
  assert.ok(Array.isArray(snap.travelTimes));
  assert.ok(snap.travelTimes.length >= 1);
  assert.ok(Array.isArray(snap.incidents));
});

test('pullTranStarPublicFeeds uses injected fetch', async () => {
  const fakeFetch = async () => ({
    ok: true,
    status: 200,
    text: async () => SAMPLE,
    headers: { get: () => 'application/xml' },
  });
  const feeds = await pullTranStarPublicFeeds({ fetchWithTimeout: fakeFetch });
  assert.ok(feeds.travelTimes.length >= 1);
  assert.ok(feeds.at > 0);
});
