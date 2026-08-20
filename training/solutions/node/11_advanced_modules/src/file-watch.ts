import { watch } from 'node:fs';
import { stat, appendFile } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';

const FILE = new URL('../watched.log', import.meta.url);

/**
 * Streams the bytes appended to `path` since byte offset `from`.
 * Returns the new size so the caller can track the next offset.
 *
 * Reading only `[from, size - 1]` is what makes this a `tail -f` rather than a
 * `cat` on every change — the file can be a gigabyte and this still reads only
 * what was just written.
 */
async function streamNewContent(path: string | URL, from: number): Promise<number> {
  const { size } = await stat(path);

  // Shrunk? The file was truncated or rotated: start over from the beginning.
  if (size < from) {
    console.log('\n--- file truncated, restarting from 0 ---');
    return streamNewContent(path, 0);
  }

  if (size === from) return size; // a 'change' event with no new bytes

  // `end` is INCLUSIVE in createReadStream, hence `size - 1`.
  await pipeline(createReadStream(path, { start: from, end: size - 1 }), process.stdout, {
    end: false, // never close stdout
  });

  return size;
}

async function main(): Promise<void> {
  // Make sure the file exists so fs.watch has something to watch.
  await appendFile(FILE, '');
  let offset = (await stat(FILE)).size;

  console.log(`watching ${FILE.pathname} — append to it to see new content`);
  console.log(`  echo hello >> ${FILE.pathname}`);

  // Serialise the handler: fs.watch fires more than once per write on most
  // platforms, and two concurrent reads would both start from the same stale
  // offset and print the same bytes twice.
  let pending = Promise.resolve();

  const watcher = watch(FILE, (eventType) => {
    if (eventType !== 'change') return;

    pending = pending
      .then(async () => {
        offset = await streamNewContent(FILE, offset);
      })
      .catch((error: unknown) => {
        console.error('watch error:', (error as Error).message);
      });
  });

  process.once('SIGINT', () => {
    watcher.close();
    console.log('\nstopped watching');
    process.exit(0);
  });
}

await main();
