// 간단한 대포알 애니메이션 컴포넌트
// - firing이 true로 바뀔 때 1.2초간 애니메이션 후 사라짐
import { useEffect, useState, useRef } from 'react';
import '../assets/CannonBallSimple.css';

interface CannonBallSimpleProps {
  firing: boolean;
  onAnimationEnd?: () => void;
}


const CannonBallSimple = ({ firing, onAnimationEnd }: CannonBallSimpleProps) => {
  const [show, setShow] = useState(false);
  const prevFiring = useRef(false);


  useEffect(() => {
    // firing이 false→true로 바뀔 때만 애니메이션 시작
    if (firing && !prevFiring.current) {
      // setShow(true)는 마이크로태스크로 지연 (동기 setState 방지)
      Promise.resolve().then(() => setShow(true));
      setTimeout(() => {
        setShow(false);
        if (onAnimationEnd) onAnimationEnd();
      }, 1200);
    }
    prevFiring.current = firing;
  }, [firing, onAnimationEnd]);

  if (!show) return null;

  // 실제 대포알 애니메이션 div
  return <div className="cannonball-simple" />;
};

export default CannonBallSimple;
