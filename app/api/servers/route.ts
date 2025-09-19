import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface Sources {
primary: string;
}

interface ServerLink {
title: string;
url: string;
serverNumber?: string;
}

interface ServerData {
servers: ServerLink[];
totalServers: number;
}

export async function GET() {
try {
// ✅ Always fetch source from GitHub JSON
const sourcesRes = await axios.get<Sources>(
'https://raw.githubusercontent.com/username/repo/main/sources.json'
);
const sources = sourcesRes.data;
const serverUrl = sources.primary;

// Fetch the page    
const response = await axios.get(serverUrl, {    
  headers: {    
    'User-Agent':    
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'    
  }    
});    

const $ = cheerio.load(response.data);    
const servers: ServerLink[] = [];    
const selectors = [    
  'a[href*="/downloads/"][class*="newdl"]',    
  'a[href*="/server/"]',    
  'a[href*="/downloads/"]',    
  '.newdl',    
  'a[rel="nofollow"][href*="server"]'    
];    

const baseUrl = new URL(serverUrl).origin;    

$(selectors.join(',')).each((index, element) => {    
  const $element = $(element);    
  const href = $element.attr('href');    
  const text = $element.text().trim();    

  if (href && text && !servers.some(s => s.url === href)) {    
    const serverMatch = text.match(/server\s*(\d+)/i) || href.match(/server[_\s]*(\d+)/i);    
    const serverNumber = serverMatch ? serverMatch[1] : undefined;    

    let title = text    
      .replace(/start\s+download\s+now\s*-?\s*/i, '')    
      .replace(/download\s+now\s*-?\s*/i, '')    
      .replace(/click\s+here\s*-?\s*/i, '')    
      .trim();    

    if (!title) {    
      title = serverNumber ? `Server ${serverNumber}` : `Download Link ${servers.length + 1}`;    
    }    

    const absoluteUrl = href.startsWith('http') ? href : `${baseUrl}${href}`;    

    servers.push({    
      title,    
      url: absoluteUrl,    
      serverNumber    
    });    
  }    
});    

const uniqueServers = servers    
  .filter((server, index, self) => index === self.findIndex(s => s.url === server.url))    
  .sort((a, b) => {    
    const numA = a.serverNumber ? parseInt(a.serverNumber) : 999;    
    const numB = b.serverNumber ? parseInt(b.serverNumber) : 999;    
    return numA - numB;    
  });    

const serverData: ServerData = {    
  servers: uniqueServers,    
  totalServers: uniqueServers.length    
};    

return NextResponse.json({    
  success: true,    
  data: serverData,    
  sourceUrl: serverUrl,    
  scrapedAt: new Date().toISOString()    
});

} catch (error) {
console.error('Error scraping server links:', error);
return NextResponse.json(
{
success: false,
error: 'Failed to fetch server links',
message: error instanceof Error ? error.message : 'Unknown error'
},
{ status: 500 }
);
}
}

