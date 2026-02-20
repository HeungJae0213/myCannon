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
  const [adLoading, setAdLoading] = useState(false);
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
      <div className="fire-row fire-row-top">
        <span className="fire-count-left">발사 횟수: {fireCount}</span>
        <button className="charge-badge-btn" onClick={() => setShowAdModal(true)}>
          충전
        </button>
      </div>
      <div
        className="cannon-ball-on-cannon cannon-ball-fire-btn"
        onClick={() => {
          if (fireCount <= 0) setShowAdModal(true);
          else handleFire();
        }}
        role="button"
        tabIndex={0}
        aria-label="발사"
      >
        <span className="cannon-ball-count">발사</span>
      </div>
      {/* 광고 모달 */}
      {showAdModal && (
        <div className="ad-modal-bg">
          <div className="ad-modal toss-ad-modal">
            <button className="ad-modal-close" onClick={() => setShowAdModal(false)} aria-label="닫기">×</button>
            <div className="ad-modal-icon" aria-hidden="true">🎁</div>
            <div className="ad-modal-title">발사 횟수가 부족해요!</div>
            <div className="ad-modal-desc">
              광고를 끝까지 시청하면 <span className="ad-modal-highlight">5번의 횟수</span>를 드려요<br />
              <span className="ad-modal-desc-sub">(광고를 보지 않으면 1회만 지급됩니다)</span>
            </div>
            <div className="ad-modal-btn-row">
              <button
                className="ad-modal-btn ad-modal-btn-gray"
                onClick={() => {
                  setFireCount(fireCount + 1);
                  setShowAdModal(false);
                }}
              >
                1회 받기
              </button>
              <button
                className="ad-modal-btn ad-modal-btn-blue"
                onClick={async () => {
                  setAdLoading(true);
                  // 광고 시청 로직 (실제 환경에서는 광고 SDK 콜백 필요)
                  if (window.showAppsInTossAdMob && interstitialAdId) {
                    window.showAppsInTossAdMob({
                      adUnitId: interstitialAdId,
                      adType: 'interstitial',
                      testMode: true,
                      onClose: (result: { completed: boolean }) => {
                        if (result.completed) setFireCount(fireCount + 5);
                        setShowAdModal(false);
                        setAdLoading(false);
                      }
                    });
                  } else {
                    // fallback: 즉시 지급
                    setTimeout(() => {
                      setFireCount(fireCount + 5);
                      setShowAdModal(false);
                      setAdLoading(false);
                    }, 1200);
                  }
                }}
                disabled={adLoading}
              >
                광고 보기
              </button>
            </div>
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
