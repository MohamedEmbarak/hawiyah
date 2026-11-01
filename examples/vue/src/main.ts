import { createApp } from 'vue';
import '@nasaq/styles/reset.css';
import '@nasaq/styles/styles.css';
import '../../../brand/fonts.css';
import './style.css';
import App from './App.vue';
import PortalExample from './PortalExample.vue';
createApp(new URLSearchParams(location.search).get('preview') === 'portal' ? PortalExample : App).mount('#app');
