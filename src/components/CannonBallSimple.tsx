import React, { useEffect, useState, useRef } from 'react';
import '../assets/CannonBallSimple.css';

interface CannonBallSimpleProps {
  firing: boolean;
  onAnimationEnd?: () => void;
}


const CannonBallSimple = ({ firing, onAnimationEnd }: CannonBallSimpleProps) => {
  const [show, setShow] = useState(false);
  const prevFiring = useRef(false);


  useEffect(() => {
    // Only trigger when firing transitions from false to true
    if (firing && !prevFiring.current) {
      // Defer setShow(true) to next microtask to avoid sync setState in effect
      Promise.resolve().then(() => setShow(true));
      setTimeout(() => {
        setShow(false);
        if (onAnimationEnd) onAnimationEnd();
      }, 1200);
    }
    prevFiring.current = firing;
  }, [firing, onAnimationEnd]);

  if (!show) return null;

  return <div className="cannonball-simple" />;
};

export default CannonBallSimple;
