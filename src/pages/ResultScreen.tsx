/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import '../assets/ResultScreen.css';
import WelcomeBall from '../components/WelcomeBall';

function getUniqueRandom(min: number, max: number, used: Set<number>): number | null {
  const available = [];
  for (let i = min; i <= max; ++i) {
    if (!used.has(i)) available.push(i);
  }
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

function ResultScreen() {
  const location = useLocation();
  const { rangeMin, rangeMax, allowDuplicate } = location.state || {};
  const min = parseInt(rangeMin, 10);
  const max = parseInt(rangeMax, 10);
  const [fireCount, setFireCount] = useState(0);
  const [showAdModal, setShowAdModal] = useState(false);
  const [adLoading, setAdLoading] = useState(false);
  const [adRetryCount, setAdRetryCount] = useState(0);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [firing, setFiring] = useState(false);
  // ballPhase state removed (animation handled by resultVisible/firing)
  const [ballY, setBallY] = useState(0); // px
  const [ballScale, setBallScale] = useState(1);
  const [showNumber, setShowNumber] = useState(false);
  const [drawnNumbers, setDrawnNumbers] = useState<Set<number>>(new Set());
  const [currentNumber, setCurrentNumber] = useState<number|null>(null);
  const toastTimeout = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);
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
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [interstitialAdId]);

  // 발사 애니메이션
  const animateFire = () => {
    setShowNumber(false);
    setBallY(0);
    setBallScale(1);
    setResultVisible(false);
    setShowConfetti(false);
    // emerge: 반원->원, 0.3s
    setTimeout(() => {
      // fly: 위로 올라가며 scale 줄임, 0.7s
      let y = 0;
      let scale = 1;
      const targetY = 180; // px 위로
      const targetScale = 0.25;
      const duration = 700;
      const start = performance.now();
      function step(now: number) {
        const t = Math.min((now - start) / duration, 1);
        y = t * targetY;
        scale = 1 - t * (1 - targetScale);
        setBallY(y);
        setBallScale(scale);
        if (t < 1) {
          animationRef.current = requestAnimationFrame(step);
        } else {
          setTimeout(() => {
            // reveal: 내려오며 커지고 숫자 공개, 0.7s
            let y2 = targetY;
            let scale2 = targetScale;
            const duration2 = 700;
            const start2 = performance.now();
            function step2(now2: number) {
              const t2 = Math.min((now2 - start2) / duration2, 1);
              y2 = targetY - t2 * targetY;
              scale2 = targetScale + t2 * (1 - targetScale);
              setBallY(y2);
              setBallScale(scale2);
              if (t2 < 1) {
                animationRef.current = requestAnimationFrame(step2);
              } else {
                setShowNumber(true);
                setResultVisible(true);
                setShowConfetti(true);
                // setTimeout(() => {
                //   setBallPhase('idle');
                //   setFiring(false);
                // }, 1200);
              }
            }
            animationRef.current = requestAnimationFrame(step2);
          }, 100);
        }
      }
      animationRef.current = requestAnimationFrame(step);
    }, 300);
  };

  // 발사 버튼 클릭
  const handleFire = () => {
    if (firing || fireCount <= 0) return;
    // 결과 공/숫자 숨기고 애니메이션부터 시작
    setResultVisible(false);
    setShowNumber(false);
    setFiring(true);
    let num: number|null = null;
    if (allowDuplicate) {
      num = Math.floor(Math.random() * (max - min + 1)) + min;
    } else {
      num = getUniqueRandom(min, max, drawnNumbers);
      if (num === null) {
        setShowToast(true);
        toastTimeout.current = setTimeout(() => setShowToast(false), 2600);
        setFiring(false);
        return;
      }
      setDrawnNumbers(new Set([...drawnNumbers, num]));
    }
    setCurrentNumber(num);
    setFireCount(fireCount - 1);
    animateFire();
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
            setTimeout(() => setFireCount(fireCount + 1), 800); // fallback 1회 지급
          }
        });
      }
    };
    doRetry();
  };

  const [resultVisible, setResultVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // 저장하기 버튼 클릭 시 갤러리 저장 (캡처)
  const handleSave = async () => {
    // 실제로는 캡처된 base64 PNG 데이터가 필요합니다.
    // 아래는 예시용 더미 데이터 (실제 환경에서는 캡처/렌더링된 base64 PNG를 사용해야 함)
    const dummyBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAUA...';
    try {
      if (typeof window.saveBase64Data === 'function') {
        await window.saveBase64Data({
          base64Data: dummyBase64,
          fileName: 'cannonball-result.png',
          mimeType: 'image/png',
          onSuccess: () => {
            alert('갤러리에 저장되었습니다!');
          },
          onError: () => {
            alert('저장에 실패했습니다.');
          }
        });
      } else {
        alert('저장 기능은 Toss 앱에서만 지원됩니다.');
      }
    } catch (error) {
      alert('저장에 실패했습니다.');
      // console.error('데이터 저장에 실패했어요:', error);
    }
  };

  return (
    <div className="result-screen">
      <div className="fire-row fire-row-top">
        <span className="fire-count-left">발사 횟수: {fireCount}</span>
        <button className="charge-badge-btn" onClick={() => setShowAdModal(true)}>
          충전
        </button>
      </div>
      {/* 빨간 대포알(충전) - 발사 횟수 1 이상, 발사 중 아닐 때만 */}
      {fireCount > 0 && !firing && (
        <div className="charged-red-ball-container">
          <div className="charged-red-ball-half">
            <WelcomeBall size={300} />
          </div>
        </div>
      )}
      {/* 발사 애니메이션용 빨간공 */}
      {firing && (
        <div
          className="firing-red-ball-anim"
          style={{
            position: 'fixed',
            left: '50%',
            bottom: `250px`,
            transform: `translateX(-50%) translateY(-${ballY}px) scale(${ballScale})`,
            zIndex: 10,
            pointerEvents: 'none',
            borderRadius: '50%',
            overflow: 'visible',
            width: 300,
            height: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            flexDirection: 'column',
          }}
        >
          <WelcomeBall size={300} />
        </div>
      )}
      {/* 결과 공/숫자: 애니메이션 끝나고만 보여줌 */}
      {resultVisible && showNumber && (
        <div
          className="firing-red-ball-anim"
          style={{
            position: 'fixed',
            left: '50%',
            bottom: `250px`,
            transform: `translateX(-50%) scale(1)`,
            zIndex: 10,
            pointerEvents: 'none',
            borderRadius: '50%',
            overflow: 'visible',
            width: 300,
            height: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            flexDirection: 'column',
          }}
        >
          <WelcomeBall size={300} />
          <div className="fired-number-reveal">{currentNumber}</div>
        </div>
      )}
      {/* 저장하기 버튼: 공이 나왔을 때만, 발사횟수 아래, 파란색 버튼 */}
      {resultVisible && showNumber && (
        <div className="save-result-btn-row">
          <button className="save-result-btn-blue" onClick={handleSave}>
            저장하기
          </button>
        </div>
      )}
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
            <div className="ad-modal-title">
              {fireCount >= 1 ? '발사 횟수를 더 충전할 수 있어요!' : '발사 횟수가 부족해요!'}
            </div>
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
      <div className={`ad-toast${showToast ? ' show' : ''}`}>광고 로딩에 실패했습니다. 1회 기회를 드립니다.</div>
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
