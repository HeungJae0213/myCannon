import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@toss/tds-mobile';
import CannonBall from '../components/CannonBall';

function ResultScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { result } = location.state || {};
  const [showContent, setShowContent] = useState(false);

  return (
    <div className="result-screen">
      <h2>축하합니다!</h2>
      <CannonBall 
        number={result} 
        onAnimationComplete={() => setShowContent(true)}
      />
      {showContent && (
        <>
          <div className="firework-effect"> {/* 폭죽 이펙트 구현 필요 */} </div>
          <Button onClick={() => {/* 갤러리 저장 기능 구현 필요 */}}>저장하기</Button>
          <Button onClick={() => navigate('/')}>닫기</Button>
        </>
      )}
    </div>
  );
}

export default ResultScreen;
