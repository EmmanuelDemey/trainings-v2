import { bootstrapApplication } from '@angular/platform-browser';
import { mountNetworkPanel } from './api/networkPanel';
import { App } from './app/app';
import { appConfig } from './app/app.config';

bootstrapApplication(App, appConfig).catch((error: unknown) => console.error(error));

// The panel at the bottom of the page: every request the fake server received.
// Plain DOM, outside Angular — the same panel for the React and Vue trainings.
mountNetworkPanel();
