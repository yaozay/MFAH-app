import 'dotenv/config';
import http from 'http';
import { URL } from 'url';

const PORT = Number(process.env.PORT || 4000);

// Sum sample data
let nextArtistId = 3;
const artists = [
  { id: 1, name: 'Claude Monet', nationality: 'French', birthYear: 1840 },
  { id: 2, name: 'Mary Cassatt', nationality: 'American', birthYear: 1844 },
];
const artworks = [
  { id: 1, title: 'Water Lilies', year: 1906, artistId: 1 },
  { id: 2, title: "The Child's Bath", year: 1893, artistId: 2 },
];

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
function send(res, code, data) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => {
      if (!data) return resolve({});
      try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return send(res, 204, {});

  const { pathname, searchParams } = new URL(req.url, 'http://localhost');
  try {
    if (req.method === 'GET' && pathname === '/api/health') {
      return send(res, 200, { ok: true });
    }

    if (req.method === 'GET' && pathname === '/api/artists') {
      const q = (searchParams.get('q') || '').toLowerCase();
      const data = q ? artists.filter(a => a.name.toLowerCase().includes(q)) : artists;
      return send(res, 200, data);
    }

    if (req.method === 'POST' && pathname === '/api/artists') {
      const body = await parseBody(req);
      if (!body.name || !body.name.trim()) return send(res, 400, { error: 'name is required' });
      const created = {
        id: nextArtistId++,
        name: body.name.trim(),
        nationality: body.nationality ?? null,
        birthYear: body.birthYear ?? null,
      };
      artists.push(created);
      return send(res, 201, created);
    }

    if (req.method === 'GET' && pathname === '/api/artworks') {
      const rows = artworks.map(a => ({
        ...a,
        artistName: artists.find(x => x.id === a.artistId)?.name || null
      }));
      return send(res, 200, rows);
    }

    return send(res, 404, { error: 'Not found' });
  } catch (e) {
    console.error(e);
    return send(res, 500, { error: 'Server error' });
  }
});

server.listen(PORT, () => console.log(`API http://localhost:${PORT}`));
