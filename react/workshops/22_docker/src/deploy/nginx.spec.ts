// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { nginxLocations, readProjectFile } from './files';

const conf = readProjectFile('nginx.conf');
const locations = nginxLocations(conf);
// '' for a block not written yet: the assertion fails, not the matcher.
const location = (matcher: string) => locations.get(matcher) ?? '';

describe('nginx.conf', () => {
  it('listens on 8080: a non-root process cannot bind port 80', () => {
    expect(conf).toMatch(/^\s*listen\s+8080\s*;/m);
  });

  it('serves index.html for any path that is not a file (the SPA fallback)', () => {
    expect(location('/')).toMatch(/try_files \$uri \$uri\/ \/index\.html;/);
  });

  it('caches the content-hashed assets for a year', () => {
    expect(location('/assets/')).toMatch(/Cache-Control "public, max-age=31536000, immutable"/);
  });

  it('answers a missing asset with a real 404, not with index.html', () => {
    expect(location('/assets/')).toMatch(/try_files \$uri =404;/);
  });

  it('never lets a browser keep a stale index.html or env.js', () => {
    expect(location('= /index.html')).toMatch(/Cache-Control "no-cache"/);
    expect(location('= /env.js')).toMatch(/Cache-Control "no-store"/);
  });

  it('answers the Kubernetes probes on /healthz', () => {
    expect(location('= /healthz')).toMatch(/return 200/);
  });
});
