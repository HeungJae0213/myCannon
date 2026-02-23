// 대포알(애니메이션 및 숫자 표시) 컴포넌트
// - 2초 후 숫자 표시, 애니메이션 완료 콜백 지원
import { useState, useEffect } from 'react';
import '../assets/CannonBall.css';

interface CannonBallProps {
  number: number;
  onAnimationComplete?: () => void;
}

function CannonBall({ number, onAnimationComplete }: CannonBallProps) {
  const [showNumber, setShowNumber] = useState(false);

  useEffect(() => {
    // 2초 후에 숫자 표시 및 콜백 실행
    const timer = setTimeout(() => {
      setShowNumber(true);
      onAnimationComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  return (
    <div className="cannonball-container">
      <div className="cannonball">
        <div className="ball-shine"></div>
        {/* 숫자는 애니메이션 후에만 표시 */}
        {showNumber && <div className="ball-number">{number}</div>}
      </div>
    </div>
  );
}

export default CannonBall;
