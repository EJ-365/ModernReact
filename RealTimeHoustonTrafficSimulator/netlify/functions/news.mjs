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

export async function handler(event) {
  const city = String(event.queryStringParameters?.city || 'Houston').slice(0, 80);
  const url = new URL('https://news.google.com/rss/search');
  url.searchParams.set('q', `${city} local news when:1d`);
  url.searchParams.set('hl', 'en-US'); url.searchParams.set('gl', 'US'); url.searchParams.set('ceid', 'US:en');
  try {
    const response = await fetch(url, { headers: { 'user-agent': 'TrafficSimulator/1.0', accept: 'application/rss+xml' } });
    if (!response.ok) throw new Error(`upstream_${response.status}`);
    return { statusCode: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=300', 'access-control-allow-origin': '*' }, body: JSON.stringify({ articles: parseNews(await response.text()) }) };
  } catch (error) {
    return { statusCode: 502, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'access-control-allow-origin': '*' }, body: JSON.stringify({ error: 'news_unavailable', detail: String(error?.message || error) }) };
  }
}