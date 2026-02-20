import { useState, useEffect } from 'react';
import '../assets/CannonBall.css';

interface CannonBallProps {
  number: number;
  onAnimationComplete?: () => void;
}

function CannonBall({ number, onAnimationComplete }: CannonBallProps) {
  const [showNumber, setShowNumber] = useState(false);

  useEffect(() => {
    // 2초 후에 숫자 표시
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
        {showNumber && <div className="ball-number">{number}</div>}
      </div>
    </div>
  );
}

export default CannonBall;
