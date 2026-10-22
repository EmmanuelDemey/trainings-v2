import { expect } from 'vitest';
import { toBeValidIsbn, toTotal } from './matchers';

expect.extend({ toBeValidIsbn, toTotal });
