// 라우팅 및 페이지 전환 애니메이션 담당
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import WelcomeScreen from './pages/WelcomeScreen';
import ModeSelectScreen from './pages/ModeSelectScreen';
import ResultScreen from './pages/ResultScreen';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './assets/fade-transition.css';

// 페이지 전환 시 페이드 애니메이션 적용
function AnimatedRoutes() {
  const location = useLocation();
  return (
    <TransitionGroup>
      <CSSTransition key={location.pathname} classNames="fade" timeout={120}>
        <Routes location={location}>
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/mode" element={<ModeSelectScreen />} />
          <Route path="/result" element={<ResultScreen />} />
        </Routes>
      </CSSTransition>
    </TransitionGroup>
  );
}

// 라우터 전체 구조 (BrowserRouter로 감쌈)
function AppRouter() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default AppRouter;
