import { describe, expect, it } from 'vitest';
import packageJson from '../package.json';
import config from '../.storybook/main';

describe('the Storybook setup', () => {
  it('has a "storybook" script that starts the dev server', () => {
    expect(packageJson.scripts).toHaveProperty('storybook', expect.stringMatching(/^storybook dev\b/));
  });

  it('has a "build-storybook" script that builds the static site', () => {
    expect(packageJson.scripts).toHaveProperty('build-storybook', expect.stringMatching(/^storybook build\b/));
  });

  it('runs on the React + Vite framework', () => {
    const framework = typeof config.framework === 'string' ? config.framework : config.framework.name;
    expect(framework).toBe('@storybook/react-vite');
  });

  it('looks for the stories in src/', () => {
    expect(config.stories).toContainEqual(expect.stringMatching(/^\.\.\/src\/.*\.stories\./));
  });

  it('loads the docs addon', () => {
    expect(config.addons).toContain('@storybook/addon-docs');
  });
});
