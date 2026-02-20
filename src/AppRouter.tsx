import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import WelcomeScreen from './pages/WelcomeScreen';
import ModeSelectScreen from './pages/ModeSelectScreen';
import FireScreen from './pages/FireScreen';
import ResultScreen from './pages/ResultScreen';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './assets/fade-transition.css';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <TransitionGroup>
      <CSSTransition key={location.pathname} classNames="fade" timeout={120}>
        <Routes location={location}>
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/mode" element={<ModeSelectScreen />} />
          <Route path="/fire" element={<FireScreen />} />
          <Route path="/result" element={<ResultScreen />} />
        </Routes>
      </CSSTransition>
    </TransitionGroup>
  );
}

function AppRouter() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default AppRouter;
