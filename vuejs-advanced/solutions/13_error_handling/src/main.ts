import { createOpsApp } from './createOpsApp';
import { installWindowNet } from './observability/windowNet';
import './style.css';

// Outside Vue, and installed before the app: a throw during `createApp()` is
// still a throw.
installWindowNet();

createOpsApp().mount('#app');
