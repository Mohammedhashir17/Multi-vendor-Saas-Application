/**
 * Scans Customer UI HTML exports, downloads unique lh3.googleusercontent images
 * into public/images and writes src/data/localImageMap.json
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const UI_ROOT = path.join(__dirname,'..','..','..','Customer UI','stitch_modern_multi_vendor_marketplace_ui');
const OUT_DIR = path.join(__dirname, '..', 'public', 'images');
const MAP_FILE = path.join(__dirname, '..', 'src', 'data', 'localImageMap.json');

function walkHtmlFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) {
    console.warn('Customer UI folder not found at', dir);
    return acc;
  }
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walkHtmlFiles(p, acc);
    else if (name === 'code.html') acc.push(p);
  }
  return acc;
}

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetchBuffer(res.headers.location).then(resolve, reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      })
      .on('error', reject);
  });
}

async function main() {
  const files = walkHtmlFiles(UI_ROOT);
  const re = /src="(https:\/\/lh3\.googleusercontent\.com[^"]+)"/g;
  const urls = new Set();
  for (const f of files) {
    const txt = fs.readFileSync(f, 'utf8');
    let m;
    while ((m = re.exec(txt))) urls.add(m[1]);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const list = [...urls].sort();
  const map = {};

  let i = 0;
  for (const url of list) {
    i++;
    const fname = `asset-${String(i).padStart(4, '0')}.jpg`;
    const dest = path.join(OUT_DIR, fname);
    map[url] = `/images/${fname}`;

    if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
      continue;
    }
    process.stdout.write(`Fetching ${i}/${list.length} ${fname}\n`);
    try {
      const buf = await fetchBuffer(url);
      fs.writeFileSync(dest, buf);
    } catch (e) {
      console.error('Failed:', url.slice(0, 80), e.message);
      delete map[url];
    }
  }

  fs.writeFileSync(MAP_FILE, JSON.stringify(map, null, 2));
  console.log('Wrote', MAP_FILE, 'entries:', Object.keys(map).length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
