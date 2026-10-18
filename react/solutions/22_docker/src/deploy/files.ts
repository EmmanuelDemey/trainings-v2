import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseAllDocuments } from 'yaml';

/** The workshop folder: the Docker build context, where every file below lives. */
export const projectRoot = fileURLToPath(new URL('../../', import.meta.url));

/** A file of the workshop, as text — '' when it does not exist yet. */
export function readProjectFile(path: string): string {
  const file = projectRoot + path;
  return existsSync(file) ? readFileSync(file, 'utf8') : '';
}

/** Every YAML document of a file (a manifest may hold several, split by `---`). */
export function readYamlDocuments(path: string): any[] {
  return parseAllDocuments(readProjectFile(path))
    .map((document) => document.toJS())
    .filter((value) => value != null);
}

export interface Instruction {
  /** Upper-cased: FROM, RUN, COPY… */
  name: string;
  args: string;
}

/**
 * The instructions of a Dockerfile, grouped by build stage (one per FROM).
 * Comments are dropped and `\` continuations joined — enough to reason about
 * the file, not a full parser.
 */
export function dockerfileStages(text: string): Instruction[][] {
  const lines = text
    .replace(/\\\r?\n/g, ' ')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== '' && !line.startsWith('#'));
  const stages: Instruction[][] = [];
  for (const line of lines) {
    const [, name = '', args = ''] = /^(\S+)\s*(.*)$/.exec(line) ?? [];
    const instruction = { name: name.toUpperCase(), args };
    if (instruction.name === 'FROM') stages.push([instruction]);
    else stages.at(-1)?.push(instruction);
  }
  return stages;
}

/**
 * The `location` blocks of an nginx `server`, keyed by what follows the word
 * `location` (`/`, `/assets/`, `= /index.html`…), their body as text.
 */
export function nginxLocations(text: string): Map<string, string> {
  const withoutComments = text.replace(/#.*$/gm, '');
  const locations = new Map<string, string>();
  for (const [, matcher, body] of withoutComments.matchAll(/location\s+([^{]+?)\s*\{([^}]*)\}/g)) {
    locations.set(matcher.replace(/\s+/g, ' '), body.replace(/\s+/g, ' ').trim());
  }
  return locations;
}
