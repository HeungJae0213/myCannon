//
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
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
  const { mode, singleCount, rangeMin, rangeMax } = location.state || {};
  const [fireCount, setFireCount] = useState(0);
  const [showAdModal, setShowAdModal] = useState(false);
  const [adLoading, setAdLoading] = useState(false);
  const [adRetryCount, setAdRetryCount] = useState(0);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const toastTimeout = useRef<number | null>(null);
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
    return () => {
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
    };
  }, [interstitialAdId]);

  const handleFire = () => {
    getRandomFromMode(mode, singleCount, rangeMin, rangeMax);
    setFireCount(fireCount - 1);
    // (애니메이션/숫자 표시는 추후 구현)
  };

  // 광고 로딩/시청 재시도 로직
  const tryShowAd = async (retry = 0) => {
    setShowLoadingModal(true);
    setAdLoading(true);
    let tried = retry;
    const tryRewarded = (cb: (success: boolean) => void) => {
      if (window.loadAppsInTossAdMob && interstitialAdId) {
        window.loadAppsInTossAdMob({
          adUnitId: interstitialAdId,
          adType: 'rewarded',
          testMode: true,
          onClose: (result: { completed: boolean }) => {
            cb(result.completed);
          }
        });
      } else {
        setTimeout(() => cb(false), 1200);
      }
    };
    const tryInterstitial = (cb: (success: boolean) => void) => {
      if (window.loadAppsInTossAdMob && interstitialAdId) {
        window.loadAppsInTossAdMob({
          adUnitId: interstitialAdId,
          adType: 'interstitial',
          testMode: true,
          onClose: (result: { completed: boolean }) => {
            cb(result.completed);
          }
        });
      } else {
        setTimeout(() => cb(false), 1200);
      }
    };
    // 2회는 rewarded, 마지막 1회는 interstitial
    const doRetry = () => {
      if (tried < 2) {
        tryRewarded(success => {
          if (success) {
            setFireCount(fireCount + 5);
            setShowAdModal(false);
            setShowLoadingModal(false);
            setAdLoading(false);
            setAdRetryCount(0);
          } else {
            tried++;
            setAdRetryCount(tried);
            doRetry();
          }
        });
      } else if (tried === 2) {
        tryInterstitial(success => {
          if (success) {
            setFireCount(fireCount + 5);
            setShowAdModal(false);
            setShowLoadingModal(false);
            setAdLoading(false);
            setAdRetryCount(0);
          } else {
            // 실패 UX
            setShowLoadingModal(false);
            setAdLoading(false);
            setShowAdModal(false);
            setAdRetryCount(0);
            setShowToast(true);
            toastTimeout.current = setTimeout(() => setShowToast(false), 2600);
            setTimeout(() => setFireCount(fireCount + 3), 800); // fallback 3회 지급
          }
        });
      }
    };
    doRetry();
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
                disabled={adLoading}
              >
                1회 받기
              </button>
              <button
                className="ad-modal-btn ad-modal-btn-blue"
                onClick={() => tryShowAd(0)}
                disabled={adLoading}
              >
                광고 보기
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 광고 로딩 모달 */}
      {showLoadingModal && (
        <div className="ad-loading-modal-bg">
          <div className="ad-loading-modal">
            <div className="ad-loading-icon"><span className="hourglass-anim" role="img" aria-label="로딩">⏳</span></div>
            <div className="ad-loading-title">광고를 불러오는 중...</div>
            <div className="ad-loading-desc">최대 3회까지 시도합니다</div>
            <div className="ad-loading-retry">{adRetryCount + 1} / 3</div>
          </div>
        </div>
      )}
      {/* 광고 실패 토스트 */}
      <div className={`ad-toast${showToast ? ' show' : ''}`}>광고 로딩에 실패했습니다. 3회 기회를 드립니다.</div>
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
