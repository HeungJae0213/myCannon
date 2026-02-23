// 앱 진입점 (React DOM 렌더링 및 글로벌 Provider 적용)
import { StrictMode } from 'react'
import { TDSMobileAITProvider } from '@toss/tds-mobile-ait';
import { createRoot } from 'react-dom/client'
import './index.css';
import './App.css';
import App from './App.tsx'

// React 앱을 #root에 마운트, 글로벌 Provider(TDSMobileAITProvider) 적용
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TDSMobileAITProvider>
      <App />
    </TDSMobileAITProvider>
  </StrictMode>,
)
