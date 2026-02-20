import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../assets/ResultScreen.css';

function getRandomFromMode(mode: string, singleCount: string, rangeMin: string, rangeMax: string) {
  if (mode === 'single') {
    const nums = singleCount.split(',').map((n: string) => parseInt(n.trim(), 10)).filter((n: number) => !isNaN(n));
    return nums[Math.floor(Math.random() * nums.length)];
  } else {
    const min = parseInt(rangeMin, 10);
    const max = parseInt(rangeMax, 10);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

function ResultScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, singleCount, rangeMin, rangeMax, allowDuplicate } = location.state || {};
  const [fireCount, setFireCount] = useState(0);
  const [showAdModal, setShowAdModal] = useState(false);
  const [showCannonBall, setShowCannonBall] = useState(false);
  const [firedNumber, setFiredNumber] = useState<number | null>(null);

  // 광고 ID는 .env에서 가져옴
  const interstitialAdId = import.meta.env.VITE_INTERSTITIAL_AD_ID;

  // 광고 로딩 (Toss Bedrock API)
  useEffect(() => {
    if (window.loadAppsInTossAdMob && interstitialAdId) {
      window.loadAppsInTossAdMob({
        adUnitId: interstitialAdId,
        adType: 'interstitial',
        testMode: true,
      });
    }
  }, [interstitialAdId]);

  const handleFire = () => {
    const picked = getRandomFromMode(mode, singleCount, rangeMin, rangeMax);
    setFireCount(fireCount - 1);
    setFiredNumber(picked);
    setShowCannonBall(true);
    setTimeout(() => {
      setShowCannonBall(false);
    }, 1200);
  };

  return (
    <div className="result-screen">
      <div className="fire-count fire-count-center">발사 횟수: {fireCount}</div>
      <button className="fire-btn" onClick={() => setShowAdModal(true)}>
        발사권 충전
      </button>
      {fireCount > 0 && (
        <button className="fire-btn" onClick={handleFire} style={{ marginLeft: 8 }}>
          대포 발사
        </button>
      )}
      {/* 광고 모달 */}
      {showAdModal && (
        <div className="ad-modal-bg">
          <div className="ad-modal">
            <h3>앱인토스 인앱광고 2.0</h3>
            <p>광고를 스킵하면 1회, 시청하면 5회 발사권을 드립니다.</p>
            <button className="fire-btn" onClick={() => { setFireCount(fireCount + 1); setShowAdModal(false); }}>스킵하기</button>
            <button className="fire-btn" onClick={() => { setFireCount(fireCount + 5); setShowAdModal(false); }}>광고 시청</button>
          </div>
        </div>
      )}
      {/* 대포알 애니메이션 (항상 노란 원 + 발사! 텍스트) */}
      <div className="cannon-ball-on-cannon">
        <span className="cannon-ball-count">발사</span>
      </div>
      <img
        src={import.meta.env.BASE_URL + 'cannon.png'}
        alt="cannon"
        className="cannon-image"
        draggable={false}
      />
    </div>
  );
}

export default ResultScreen;
