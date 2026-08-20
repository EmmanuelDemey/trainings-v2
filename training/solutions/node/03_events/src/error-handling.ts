import { EventEmitter } from 'node:events';

/**
 * Demonstrates the special `error` event and listener lifecycle.
 *
 * An `EventEmitter` that emits `'error'` with no listener will THROW and can
 * crash the process. Always wire an `error` listener on emitters that may fail.
 */
export function demoErrorHandling(): void {
  const emitter = new EventEmitter();

  // Without this listener, the `emit('error', ...)` below would be rethrown as
  // an uncaught exception and take the process down. This is the one event name
  // Node treats specially — everything else is inert when nobody listens.
  emitter.on('error', (error: Error) => {
    console.log('[error-handling] caught:', error.message);
  });

  // `once` detaches itself after the first call: the second emit finds no
  // listener left and prints nothing.
  emitter.once('ready', () => {
    console.log('[error-handling] ready (this line prints exactly once)');
  });

  // A NAMED handler, so it can be detached. An inline arrow cannot: `off` works
  // by reference, and this is the single most common source of listener leaks.
  const onTick = (value: number): void => {
    console.log('[error-handling] tick', value);
  };
  emitter.on('tick', onTick);

  emitter.emit('error', new Error('something went wrong'));

  emitter.emit('ready');
  emitter.emit('ready'); // nothing: `once` already removed the listener

  emitter.emit('tick', 1);
  emitter.off('tick', onTick);
  emitter.emit('tick', 2); // nothing: the listener is gone

  console.log(
    `[error-handling] remaining listeners: ready=${emitter.listenerCount('ready')} ` +
      `tick=${emitter.listenerCount('tick')}`,
  );
}
