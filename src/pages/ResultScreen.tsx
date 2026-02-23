// 결과 화면(공 뽑기, 발사, 저장, 광고 등 전체 로직)
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../assets/ResultScreen.css';
import WelcomeBall from '../components/WelcomeBall';
import { loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/web-framework';

// 중복 없는 랜덤 번호 추출 함수 (이미 뽑힌 번호 제외)
function getUniqueRandom(min: number, max: number, used: Set<number>): number | null {
  const available = [];
  for (let i = min; i <= max; ++i) {
    if (!used.has(i)) available.push(i);
  }
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

// 결과 화면 전체 로직 및 렌더링
function ResultScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const { rangeMin, rangeMax, allowDuplicate } = location.state || {};
  const min = parseInt(rangeMin, 10);
  const max = parseInt(rangeMax, 10);
  const [drawnNumbers, setDrawnNumbers] = useState<Set<number>>(new Set());
  // 남은 공 개수 계산 (중복 허용 안 할 때만)
  const remainingBalls = allowDuplicate ? null : (max - min + 1 - drawnNumbers.size); 
  const [showNoBallsMsg, setShowNoBallsMsg] = useState(false);
  // 남은 공 개수 0일 때 페이지 이동은 handleFire에서만 처리
  const [fireCount, setFireCount] = useState(0);
  const [showAdModal, setShowAdModal] = useState(false);
  const [adLoading, ] = useState(false);
  const [adRetryCount, ] = useState(0);
  const [showLoadingModal, ] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [firing, setFiring] = useState(false);
  const [fireCooldown, setFireCooldown] = useState(false);
  const [chargeCooldown, setChargeCooldown] = useState(false);
  // ballPhase state removed (animation handled by resultVisible/firing)
  const [ballY, setBallY] = useState(0); // px
  const [ballScale, setBallScale] = useState(1);
  const [showNumber, setShowNumber] = useState(false);
  const [currentNumber, setCurrentNumber] = useState<number|null>(null);
  const toastTimeout = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);
  const [, setShowConfetti] = useState(false);
  // 광고 ID는 .env에서 가져옴
  const interstitialAdId = import.meta.env.VITE_INTERSTITIAL_AD_ID;
  const adGroupId = import.meta.env.VITE_REWARDED_AD_ID || '';
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const adUnregisterRef = useRef<null | (() => void)>(null);

  // 광고는 컴포넌트 마운트 시 미리 로드
  useEffect(() => {
    if (!loadFullScreenAd?.isSupported?.() || !adGroupId) return;
    let retryCount = 0;
    const maxRetry = 3;
    const tryLoadAd = () => {
      // 0,1회는 보상형, 2회는 전면형 광고 그룹 ID 사용
      const groupId = retryCount < 2 ? adGroupId : interstitialAdId;
      adUnregisterRef.current = loadFullScreenAd({
        options: { adGroupId: groupId },
        onEvent: (event) => {
          if (event.type === 'loaded') setIsAdLoaded(true);
        },
        onError: () => {
          setIsAdLoaded(false);
          retryCount++;
          if (retryCount < maxRetry) {
            setTimeout(tryLoadAd, 800); // 0.8초 후 재시도
          }
        },
      });
    };
    tryLoadAd();
    return () => {
      if (adUnregisterRef.current) adUnregisterRef.current();
    };
  }, [adGroupId, interstitialAdId]);

  // 광고 보기 버튼 클릭 시 이미 로드된 광고 노출
  const handleShowAd = () => {
    if (!isAdLoaded || !showFullScreenAd?.isSupported?.()) return;
    showFullScreenAd({
      options: { adGroupId },
      onEvent: (event) => {
        if (event.type === 'userEarnedReward') {
          setFireCount(fireCount + 5);
          setShowAdModal(false);
        }
        if (event.type === 'dismissed' || event.type === 'failedToShow') {
          setIsAdLoaded(false);
          // 광고 닫힘/실패 시 다음 광고 미리 로드
          adUnregisterRef.current = loadFullScreenAd({
            options: { adGroupId },
            onEvent: (e) => {
              if (e.type === 'loaded') setIsAdLoaded(true);
            },
            onError: () => setIsAdLoaded(false),
          });
        }
      },
      onError: () => {
        setIsAdLoaded(false);
      },
    });
  };

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
      const duration = 400;
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
                setFiring(false); // 애니메이션 종료 후 발사 가능하게
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
    if (firing || fireCount <= 0 || fireCooldown) return;
    if (!allowDuplicate && remainingBalls === 0) {
      setShowNoBallsMsg(true);
      setTimeout(() => {
        setShowNoBallsMsg(false);
        navigate('/'); // 범위 입력 페이지로 이동
      }, 2000);
      return;
    }
    setFireCooldown(true);
    setTimeout(() => setFireCooldown(false), 2000);
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

  const [resultVisible, setResultVisible] = useState(false);

  // 갤러리 저장 (Apps in Toss 공식 API 사용)
  // 메모리 최적화: 타이머 참조를 ref로 관리하여 정리 가능하도록 수정
  const saveToastTimerRef = useRef<number | undefined>(undefined);

  // 저장 토스트 상태
  const [saveToast, setSaveToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  // 저장하기 버튼 클릭 시 갤러리 저장 (캡처)
  const handleSave = async () => {
    try {
      // 결과가 표시 중일 때만 저장 (resultVisible && showNumber)
      if (!(resultVisible && showNumber)) {
        // 기존 타이머 정리
        if (saveToastTimerRef.current) {
          clearTimeout(saveToastTimerRef.current);
        }
        setSaveToast({ show: true, message: '먼저 공을 뽑아주세요!' });
        saveToastTimerRef.current = setTimeout(() => {
          setSaveToast({ show: false, message: '' });
          saveToastTimerRef.current = undefined;
        }, 2500);
        return;
      }

      // 검은색 영역 전체(결과+텍스트+버튼) 캡처: .result-screen의 부모 div를 타겟팅
      const resultScreen = document.querySelector('.result-screen');
      if (!resultScreen) {
        setSaveToast({ show: true, message: '캡처 대상을 찾을 수 없습니다.' });
        return;
      }
      const blackArea = resultScreen.parentElement;
      if (!blackArea || !(blackArea instanceof HTMLElement)) {
        setSaveToast({ show: true, message: '캡처 영역을 찾을 수 없습니다.' });
        return;
      }
      // DOM 업데이트 대기
      await new Promise(resolve => setTimeout(resolve, 50));
      let html2canvas: (el: HTMLElement, options?: object) => Promise<HTMLCanvasElement>;
      try {
        html2canvas = (await import('html2canvas')).default;
      } catch (e) {
        setSaveToast({ show: true, message: 'html2canvas 라이브러리가 필요합니다.' });
        return;
      }
      const canvas = await html2canvas(blackArea, {
        backgroundColor: null,
        scale: 1.5,
        logging: false,
        useCORS: true,
        allowTaint: true,
        removeContainer: true,
        onclone: (clonedDoc: Document) => {
          // 필요시 스타일 최적화
        }
      });

      // Canvas를 Base64로 변환 (JPEG로 압축하여 메모리 및 파일 크기 감소)
      const base64Data = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
      const timestamp = new Date().getTime();
      const filename = `cannonball_result_${timestamp}.jpg`;

      // Canvas 메모리 정리
      canvas.width = 0;
      canvas.height = 0;

      // Apps in Toss saveBase64Data API 사용
      try {
        if (typeof (window as unknown as { saveBase64Data?: (args: { base64Data: string; fileName: string; mimeType: string; onSuccess: () => void; onError: () => void }) => void }).saveBase64Data === 'function') {
          await (window as unknown as { saveBase64Data: (args: { base64Data: string; fileName: string; mimeType: string; onSuccess: () => void; onError: () => void }) => void }).saveBase64Data({
            base64Data,
            fileName: filename,
            mimeType: 'image/jpeg',
            onSuccess: () => {
              setSaveToast({ show: true, message: '📷 갤러리에 저장했습니다!' });
              if (saveToastTimerRef.current) clearTimeout(saveToastTimerRef.current);
              saveToastTimerRef.current = setTimeout(() => {
                setSaveToast({ show: false, message: '' });
                saveToastTimerRef.current = undefined;
              }, 2500);
            },
            onError: () => {
              setSaveToast({ show: true, message: '저장에 실패했습니다.' });
              if (saveToastTimerRef.current) clearTimeout(saveToastTimerRef.current);
              saveToastTimerRef.current = setTimeout(() => {
                setSaveToast({ show: false, message: '' });
                saveToastTimerRef.current = undefined;
              }, 2500);
            }
          });
        } else {
          // 샌드박스/로컬 등 미지원 환경에서는 브라우저 다운로드로 대체
          fallbackDownload(canvas, filename.replace('.jpg', '.png'));
        }
      } catch (saveError) {
        // 실패 시 브라우저 다운로드로 대체
        fallbackDownload(canvas, filename.replace('.jpg', '.png'));
      }
    } catch (error) {
      setSaveToast({ show: true, message: '이미지 저장에 실패했습니다.' });
      if (saveToastTimerRef.current) {
        clearTimeout(saveToastTimerRef.current);
      }
      saveToastTimerRef.current = setTimeout(() => {
        setSaveToast({ show: false, message: '' });
        saveToastTimerRef.current = undefined;
      }, 2500);
    }
  };

  // 브라우저 다운로드 (대체 방법)
  // 메모리 최적화: Canvas 정리 및 타이머 관리 추가
  const fallbackDownload = (canvas: HTMLCanvasElement, filename: string) => {
    canvas.toBlob((blob) => {
      canvas.width = 0;
      canvas.height = 0;
      if (!blob) {
        setSaveToast({ show: true, message: '이미지 생성에 실패했습니다.' });
        if (saveToastTimerRef.current) {
          clearTimeout(saveToastTimerRef.current);
        }
        saveToastTimerRef.current = setTimeout(() => {
          setSaveToast({ show: false, message: '' });
          saveToastTimerRef.current = undefined;
        }, 2500);
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = filename;
      link.href = url;
      link.style.display = 'none';
      document.body.appendChild(link);
      setTimeout(() => {
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 100);
      }, 0);
      setSaveToast({ show: true, message: '💾 다운로드 폴더를 확인해주세요!' });
      if (saveToastTimerRef.current) {
        clearTimeout(saveToastTimerRef.current);
      }
      saveToastTimerRef.current = setTimeout(() => {
        setSaveToast({ show: false, message: '' });
        saveToastTimerRef.current = undefined;
      }, 2500);
    }, 'image/png');
  };

  return (
    <div>
      {saveToast.show && (
        <div style={{ position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)', background: '#222', color: '#fff', fontSize: '1.1rem', fontWeight: 600, padding: '16px 32px', borderRadius: 16, zIndex: 2000, boxShadow: '0 2px 8px #0004' }}>
          {saveToast.message}
        </div>
      )}
      {showNoBallsMsg && (
        <div style={{ position: 'fixed', top: '30%', left: '50%', transform: 'translateX(-50%)', background: '#222', color: '#fff', fontSize: '1.2rem', fontWeight: 'bold', padding: '24px 32px', borderRadius: '18px', zIndex: 999 }}>
          쏠 수 있는 공이 없어요<br />처음 페이지로 돌아가요
        </div>
      )}
      <div className="result-screen">
        <div className="fire-row fire-row-top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span className="fire-count-left">발사 횟수: {fireCount}</span>
          {!allowDuplicate && (
            <span className="fire-count-left" style={{ marginTop: 0 }}>
              남은 공 개수: {max - min + 1 - drawnNumbers.size}
            </span>
          )}
        </div>
        <button
          className="charge-badge-btn"
          onClick={() => {
            if (chargeCooldown) return;
            setChargeCooldown(true);
            setTimeout(() => setChargeCooldown(false), 1000);
            setShowAdModal(true);
          }}
          disabled={chargeCooldown}
        >
          충전
        </button>
      </div>
      {/* 빨간 대포알(충전) - 발사 횟수 1 이상, 발사 중 아닐 때만 */}
      {fireCount > 0 && !firing && !(resultVisible && showNumber) && (
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
        {/* 저장하기 버튼: 숫자가 뽑힌 후 항상 보임 */}
        {currentNumber !== null && (
          <div className="save-result-btn-row">
            <button className="save-result-btn-blue" onClick={handleSave}>
              저장하기
            </button>
          </div>
        )}
      <div
        className="cannon-ball-on-cannon cannon-ball-fire-btn"
        onClick={() => {
          if (fireCooldown) return;
          if (fireCount <= 0) setShowAdModal(true);
          else handleFire();
        }}
        role="button"
        tabIndex={0}
        aria-label="발사"
        style={fireCooldown ? { opacity: 0.5, pointerEvents: 'none' } : {}}
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
              <span className="ad-modal-desc-sub">(광고를 보지 않으면 1회만 지급돼요)</span>
            </div>
            <div className="ad-modal-btn-row">
              <button
                className="ad-modal-btn ad-modal-btn-gray"
                onClick={() => {
                  setFireCount(fireCount + 1);
                  setShowAdModal(false);
                  setResultVisible(false);
                  setFiring(false);
                  setShowNumber(false);
                }}
                disabled={adLoading}
              >
                1회 받기
              </button>
              <button
                className="ad-modal-btn ad-modal-btn-blue"
                onClick={handleShowAd}
                disabled={!isAdLoaded || adLoading}
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
            <div className="ad-loading-desc">최대 3회까지 시도해요</div>
            <div className="ad-loading-retry">{adRetryCount + 1} / 3</div>
          </div>
        </div>
      )}
      {/* 광고 실패 토스트 */}
      <div className={`ad-toast${showToast ? ' show' : ''}`}>광고 로딩에 실패했어요. 1회 기회를 드려요.</div>
      <img
        src={import.meta.env.BASE_URL + 'cannon.png'}
        alt="cannon"
        className="cannon-image"
        draggable={false}
      />
    </div>
  </div>
  );
}

export default ResultScreen;
