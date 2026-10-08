import {
  apiLog,
  apiSettings,
  clearApiLog,
  onApiChange,
  simulateExternalChange,
  type ApiCall,
} from './fakeApi';

/**
 * The Network panel pinned to the bottom of every workshop page: what the fake
 * server received, how many times, and the switches that make it misbehave.
 *
 * Plain DOM on purpose — the same panel for React, Angular and Vue, mounted once
 * from the entry file:
 *
 *   mountNetworkPanel();
 *
 * The specs never mount it: they read `apiLog` directly.
 */

const STYLE = `
.tq-network { position: fixed; inset: auto 0 0 0; max-height: 38vh; overflow: auto; z-index: 1000;
  font: 13px/1.4 system-ui, sans-serif; color: #e5e7eb; background: #111827; border-top: 3px solid #f59e0b;
  padding: .5rem 1rem; box-shadow: 0 -4px 16px rgb(0 0 0 / .25); }
.tq-network h2 { font-size: 13px; margin: 0; text-transform: uppercase; letter-spacing: .08em; color: #f59e0b; }
.tq-network .tq-row { display: flex; flex-wrap: wrap; align-items: center; gap: .4rem 1rem; margin-bottom: .4rem; }
.tq-network button, .tq-network select { font: inherit; color: inherit; background: #1f2937; border: 1px solid #374151;
  border-radius: 4px; padding: .1rem .5rem; cursor: pointer; }
.tq-network table { border-collapse: collapse; width: 100%; }
.tq-network td { padding: .1rem .5rem; border-top: 1px solid #1f2937; }
.tq-network code { color: #93c5fd; }
.tq-network .tq-count { width: 4rem; text-align: right; }
.tq-network .tq-dup { color: #f87171; font-weight: 700; }
.tq-network .tq-pending { color: #fbbf24; }
.tq-network .tq-failed { color: #f87171; }
.tq-network .tq-muted { color: #9ca3af; }
.tq-network.tq-collapsed table, .tq-network.tq-collapsed .tq-controls { display: none; }
body { padding-bottom: 40vh; }
`;

interface Row {
  label: string;
  count: number;
  pending: number;
  failed: number;
}

function rowsOf(log: readonly ApiCall[]): Row[] {
  const rows = new Map<string, Row>();
  for (const call of log) {
    const row = rows.get(call.label) ?? { label: call.label, count: 0, pending: 0, failed: 0 };
    row.count += 1;
    if (call.state === 'pending') row.pending += 1;
    if (call.state === 'failed') row.failed += 1;
    rows.set(call.label, row);
  }
  return [...rows.values()];
}

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  properties: Partial<HTMLElementTagNameMap[K]> = {},
  children: (Node | string)[] = [],
): HTMLElementTagNameMap[K] {
  const node = Object.assign(document.createElement(tag), properties);
  node.append(...children);
  return node;
}

/** Mounts the panel at the end of `target`. Returns a function that removes it. */
export function mountNetworkPanel(target: HTMLElement = document.body): () => void {
  if (!document.getElementById('tq-network-style')) {
    document.head.append(element('style', { id: 'tq-network-style', textContent: STYLE }));
  }

  const panel = element('section', { className: 'tq-network' });
  panel.setAttribute('aria-label', 'Network');
  target.append(panel);

  function render(): void {
    const rows = rowsOf(apiLog);

    const toggle = element('button', {
      type: 'button',
      textContent: panel.classList.contains('tq-collapsed') ? 'Show' : 'Hide',
      onclick: () => {
        panel.classList.toggle('tq-collapsed');
        render();
      },
    });

    const latency = element('select', {
      onchange: () => {
        apiSettings.latencyMs = Number(latency.value);
      },
    });
    for (const ms of [0, 400, 1500, 3000]) {
      latency.append(element('option', { value: String(ms), textContent: `${ms} ms`, selected: apiSettings.latencyMs === ms }));
    }

    const failWrites = element('input', {
      type: 'checkbox',
      checked: apiSettings.failWrites,
      onchange: () => {
        apiSettings.failWrites = failWrites.checked;
      },
    });

    const controls = element('div', { className: 'tq-row tq-controls' }, [
      element('label', {}, ['Latency ', latency]),
      element('label', {}, [failWrites, ' The server refuses every write']),
      element('button', {
        type: 'button',
        textContent: 'Fail the next request',
        onclick: () => {
          apiSettings.failNextRequest = true;
        },
      }),
      element('button', {
        type: 'button',
        textContent: 'Another user closes an issue',
        onclick: () => {
          simulateExternalChange();
        },
      }),
      element('button', { type: 'button', textContent: 'Clear the log', onclick: clearApiLog }),
    ]);

    const pending = rows.reduce((sum, row) => sum + row.pending, 0);
    const header = element('div', { className: 'tq-row' }, [
      element('h2', { textContent: 'Network' }),
      element('span', {
        className: pending > 0 ? 'tq-pending' : 'tq-muted',
        textContent: `${apiLog.length} request(s) · ${pending} in flight`,
      }),
      toggle,
    ]);

    const table = element(
      'table',
      {},
      rows.length === 0
        ? [element('tr', {}, [element('td', { className: 'tq-muted', textContent: 'No request yet.' })])]
        : rows.map((row) => {
            // The same GET twice is what a query layer is there to avoid.
            const duplicated = row.count > 1 && row.label.startsWith('GET');
            const states = [
              row.pending > 0 ? element('span', { className: 'tq-pending', textContent: ` · ${row.pending} in flight` }) : '',
              row.failed > 0 ? element('span', { className: 'tq-failed', textContent: ` · ${row.failed} failed` }) : '',
            ];
            return element('tr', {}, [
              element('td', {}, [element('code', { textContent: row.label }), ...states]),
              element('td', { className: duplicated ? 'tq-count tq-dup' : 'tq-count', textContent: `${row.count}×` }),
            ]);
          }),
    );

    panel.replaceChildren(header, controls, table);
  }

  render();
  const unsubscribe = onApiChange(render);
  return () => {
    unsubscribe();
    panel.remove();
  };
}
