import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  return (
    <div
      style={{
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#1a1a2e',
        color: '#e0e0e0',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <h1 style={{ fontSize: '2rem', fontWeight: 600, letterSpacing: '0.05em' }}>Montagen</h1>
    </div>
  );
}

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
