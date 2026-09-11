// The participant kit of one training — the one download to hand out on day one.
//
//   <slug>-participants.zip
//     <slug>-participants/
//       <slug>-slides.pdf       the deck, when its export succeeded
//       <slug>-workshops.pdf    the handbook
//       tp/                     the workshop folders, as the learners work in them
//
// Never the solutions: they have their own folder and their own zip. It reads
// both PDFs from the downloads folder, so it runs after both exports; a PDF that
// failed is simply not in the kit.

import { createWriteStream, existsSync } from 'node:fs';
import { join } from 'node:path';
import archiver from 'archiver';

/** Never zipped: what an install or a build regenerates, and local env overrides. */
export const NOT_SHIPPED = [
  '**/node_modules/**',
  '**/dist/**',
  '**/.astro/**',
  '**/coverage/**',
  '**/*.log',
  // The mode files are part of the workshops; only the local overrides may hold
  // real values.
  '**/.env.local',
  '**/.env.*.local',
];

export function participantsZip({ slug, workshopsDir, downloadsDir }) {
  const name = `${slug}-participants`;
  const pdfs = [`${slug}-slides.pdf`, `${slug}-workshops.pdf`].filter((pdf) =>
    existsSync(join(downloadsDir, pdf)),
  );

  return new Promise((resolve, reject) => {
    const output = createWriteStream(join(downloadsDir, `${name}.zip`));
    const archive = archiver('zip', { zlib: { level: 9 } });
    output.on('close', () => resolve(archive.pointer()));
    archive.on('error', reject);
    archive.pipe(output);
    for (const pdf of pdfs) {
      archive.file(join(downloadsDir, pdf), { name: `${name}/${pdf}` });
    }
    // `_*`: an optional module that is turned off — kept out of the kit as the
    // site and the handbook keep it out (see training/scripts/modules.mjs).
    archive.glob(
      '**/*',
      { cwd: workshopsDir, dot: true, ignore: ['_*/**', ...NOT_SHIPPED] },
      { prefix: `${name}/tp` },
    );
    archive.finalize();
  });
}
