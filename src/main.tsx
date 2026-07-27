import './tema.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import { aplicarPrefs } from './features/prefs';
import { App } from './App';

// Antes do render: sem isso a página pisca no tema errado antes do 1º efeito.
aplicarPrefs(store.getState().prefs);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
