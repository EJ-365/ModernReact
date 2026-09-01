function decodeXml(value = '') {
  return String(value).replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

function tag(item, name) {
  return decodeXml(item.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'))?.[1] || '').trim();
}

function parseNews(xml) {
  return [...String(xml).matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, 6).map((match) => {
    const item = match[1];
    return { title: tag(item, 'title'), url: tag(item, 'link'), domain: tag(item, 'source'), published: tag(item, 'pubDate') };
  }).filter((item) => item.title && item.url);
}

export default async function handler(req, res) {
  const city = String(req.query?.city || 'Houston').slice(0, 80);
  const url = new URL('https://news.google.com/rss/search');
  url.searchParams.set('q', `${city} local news when:1d`);
  url.searchParams.set('hl', 'en-US'); url.searchParams.set('gl', 'US'); url.searchParams.set('ceid', 'US:en');
  try {
    const response = await fetch(url, { headers: { 'user-agent': 'TrafficSimulator/1.0', accept: 'application/rss+xml' } });
    if (!response.ok) throw new Error(`upstream_${response.status}`);
    res.setHeader('cache-control', 'public, max-age=300');
    res.status(200).json({ articles: parseNews(await response.text()) });
  } catch (error) {
    res.status(502).json({ error: 'news_unavailable', detail: String(error?.message || error) });
  }
}