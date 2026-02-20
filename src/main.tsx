import { StrictMode } from 'react'
import { TDSMobileAITProvider } from '@toss/tds-mobile-ait';
import { createRoot } from 'react-dom/client'
import './index.css';
import './App.css';
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TDSMobileAITProvider>
      <App />
    </TDSMobileAITProvider>
  </StrictMode>,
)
