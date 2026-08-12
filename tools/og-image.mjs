// Generates the 1200x630 social preview card as a real PNG.
//
// Social platforms will not render an SVG og:image, and this project has no image pipeline
// and no dependencies, so the card is rasterised here: a tiny framebuffer, a few drawing
// primitives, and a hand-rolled PNG encoder over node:zlib. Shapes only — no text — because
// glyph rasterisation without a font library would look worse than the brand mark alone,
// and every platform renders og:title beside the image anyway.
import { deflateSync } from 'node:zlib';

const WIDTH = 1200;
const HEIGHT = 630;

const CREAM = [253, 253, 247];
const GRID = [225, 240, 244]; // #85c4e9 at 23% over cream, pre-blended
const OXBLOOD = [123, 36, 40];
const DEEP = [90, 26, 29];
const INK = [30, 20, 15];
const WHITE = [255, 255, 255];
const PAPER_EDGE = [233, 221, 200];
const MUTED = [181, 163, 137];

const createCanvas = () => ({ width: WIDTH, height: HEIGHT, data: new Uint8Array(WIDTH * HEIGHT * 3) });

const setPixel = (canvas, x, y, [r, g, b]) => {
  if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return;
  const i = (y * canvas.width + x) * 3;
  canvas.data[i] = r;
  canvas.data[i + 1] = g;
  canvas.data[i + 2] = b;
};

const fillRect = (canvas, x0, y0, w, h, colour) => {
  for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) setPixel(canvas, x, y, colour);
};

const fillCircle = (canvas, cx, cy, radius, colour) => {
  for (let y = cy - radius; y <= cy + radius; y++) {
    for (let x = cx - radius; x <= cx + radius; x++) {
      if ((x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2) setPixel(canvas, x, y, colour);
    }
  }
};

/** Scanline polygon fill, even-odd rule. */
const fillPolygon = (canvas, points, colour) => {
  const ys = points.map((p) => p[1]);
  for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) {
    const crossings = [];
    for (let i = 0; i < points.length; i++) {
      const [x1, y1] = points[i];
      const [x2, y2] = points[(i + 1) % points.length];
      if (y1 === y2) continue;
      if (y >= Math.min(y1, y2) && y < Math.max(y1, y2)) {
        crossings.push(x1 + ((y - y1) / (y2 - y1)) * (x2 - x1));
      }
    }
    crossings.sort((a, b) => a - b);
    for (let i = 0; i + 1 < crossings.length; i += 2) {
      for (let x = Math.ceil(crossings[i]); x <= Math.floor(crossings[i + 1]); x++) setPixel(canvas, x, y, colour);
    }
  }
};

/* ------------------------------------------------------------ PNG encoding */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

const chunk = (type, data) => {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
};

const encodePng = (canvas) => {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(canvas.width, 0);
  header.writeUInt32BE(canvas.height, 4);
  header[8] = 8; // bit depth
  header[9] = 2; // colour type: truecolour RGB
  // 10,11,12 stay zero: deflate, adaptive filtering, no interlace

  // One filter byte (0 = None) per scanline, then the row's RGB triples.
  const stride = canvas.width * 3;
  const raw = Buffer.alloc((stride + 1) * canvas.height);
  for (let y = 0; y < canvas.height; y++) {
    raw[y * (stride + 1)] = 0;
    Buffer.from(canvas.data.subarray(y * stride, (y + 1) * stride)).copy(raw, y * (stride + 1) + 1);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
};

/* ------------------------------------------------------------- the artwork */

const roundedRect = (canvas, x, y, w, h, radius, colour) => {
  fillRect(canvas, x + radius, y, w - radius * 2, h, colour);
  fillRect(canvas, x, y + radius, w, h - radius * 2, colour);
  fillCircle(canvas, x + radius, y + radius, radius, colour);
  fillCircle(canvas, x + w - radius, y + radius, radius, colour);
  fillCircle(canvas, x + radius, y + h - radius, radius, colour);
  fillCircle(canvas, x + w - radius, y + h - radius, radius, colour);
};

export const renderOgImage = () => {
  const canvas = createCanvas();

  // graph-paper ground, as on the site
  fillRect(canvas, 0, 0, WIDTH, HEIGHT, CREAM);
  for (let x = 0; x < WIDTH; x += 30) fillRect(canvas, x, 0, 1, HEIGHT, GRID);
  for (let y = 0; y < HEIGHT; y += 30) fillRect(canvas, 0, y, WIDTH, 1, GRID);

  // the card: a sheet of paper laid on the grid, with a soft edge beneath it
  roundedRect(canvas, 66, 62, 1068, 500, 26, PAPER_EDGE);
  roundedRect(canvas, 60, 56, 1068, 500, 26, WHITE);

  // inkwell mark on the left
  const cx = 300;
  const cy = 300;
  fillCircle(canvas, cx, cy, 132, OXBLOOD);
  fillCircle(canvas, cx, cy, 120, DEEP);
  fillCircle(canvas, cx, cy + 34, 40, INK);
  fillPolygon(
    canvas,
    [
      [cx - 6, cy + 40],
      [cx + 34, cy - 66],
      [cx + 86, cy - 106],
      [cx + 62, cy - 40],
      [cx + 16, cy + 50],
    ],
    CREAM
  );

  // "BOZ" drawn as geometry: no font library is available, so the letterforms are built
  // from rectangles, circles and one polygon, with counters punched in the card colour.
  const ink = INK;
  // B
  fillRect(canvas, 486, 196, 36, 168, ink);
  roundedRect(canvas, 486, 196, 112, 86, 30, ink);
  roundedRect(canvas, 522, 224, 48, 30, 14, WHITE);
  roundedRect(canvas, 486, 278, 124, 86, 30, ink);
  roundedRect(canvas, 522, 306, 56, 30, 14, WHITE);
  // O
  fillCircle(canvas, 706, 280, 84, ink);
  fillCircle(canvas, 706, 280, 44, WHITE);
  // Z
  fillPolygon(
    canvas,
    [
      [816, 196],
      [960, 196],
      [960, 232],
      [876, 328],
      [960, 328],
      [960, 364],
      [816, 364],
      [816, 328],
      [900, 232],
      [816, 232],
    ],
    ink
  );

  // tagline rule and accent, standing in for the strapline
  roundedRect(canvas, 486, 410, 330, 14, 7, MUTED);
  roundedRect(canvas, 486, 444, 168, 14, 7, OXBLOOD);

  // torn-paper band along the bottom, echoing the site's section edges
  fillRect(canvas, 0, HEIGHT - 22, WIDTH, 22, OXBLOOD);

  return encodePng(canvas);
};
