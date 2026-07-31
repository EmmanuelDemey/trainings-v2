import { watch, createReadStream } from 'node:fs';
import { stat, appendFile } from 'node:fs/promises';

const FILE = new URL('../watched.log', import.meta.url);

/**
 * Streams the bytes appended to `path` since byte offset `from`.
 * Returns the new size so the caller can track the next offset.
 */
async function streamNewContent(path: string | URL, from: number): Promise<number> {
  // TODO: stat the file to get its current size.
  // TODO: if it grew, createReadStream(path, { start: from, end: size - 1 }) and
  //       pipe/write the chunks to stdout.
  // TODO: return the new size.
  throw new Error('TODO: implement streamNewContent');
}

async function main(): Promise<void> {
  // Make sure the file exists so fs.watch has something to watch.
  await appendFile(FILE, '');
  let offset = (await stat(FILE)).size;

  console.log(`watching ${FILE.pathname} — append to it to see new content`);

  // TODO: use fs.watch(FILE, ...) and, on a 'change' event, call
  //   offset = await streamNewContent(FILE, offset)
  // to print only the newly appended bytes.
}

await main();
