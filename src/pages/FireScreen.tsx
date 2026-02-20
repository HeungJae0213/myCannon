import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Modal } from '@toss/tds-mobile';
import CannonBody from '../components/CannonBody';
import CannonBallSimple from '../components/CannonBallSimple';
import '../components/CannonBallSimple.css';

function FireScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, singleNumbers, rangeMin, rangeMax } = location.state || {};
  const [fireCount, setFireCount] = useState(0);
  const [showAdModal, setShowAdModal] = useState(false);
  const [isFiring, setIsFiring] = useState(false);
  const [showCannonBall, setShowCannonBall] = useState(false);
  const [firedNumber, setFiredNumber] = useState<number|null>(null);
  // result 변수 제거 (불필요)

  const handleFire = () => {
    let picked;
    if (mode === 'single') {
      const nums = singleNumbers.split(',').map((n: string) => parseInt(n.trim(), 10)).filter((n: number) => !isNaN(n));
      picked = nums[Math.floor(Math.random() * nums.length)];
    } else {
      const min = parseInt(rangeMin, 10);
      const max = parseInt(rangeMax, 10);
      picked = Math.floor(Math.random() * (max - min + 1)) + min;
    }
    setFireCount(fireCount - 1);
    setFiredNumber(picked);
    setIsFiring(true);
    setShowCannonBall(true);
    setTimeout(() => {
      setIsFiring(false);
    }, 300); // 리코일 애니메이션 시간
    setTimeout(() => {
      setShowCannonBall(false);
      navigate('/result', { state: { result: picked } });
    }, 2000); // 대포알 애니메이션 시간
  };

  return (
    <div className="fire-screen" style={{ position: 'relative' }}>
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 220, height: 160 }}>
          <CannonBody width={200} height={120} />
          <CannonBallSimple firing={showCannonBall} />
        </div>
      </div>
      <h2>발사 횟수: {fireCount}</h2>
      <Button onClick={() => setShowAdModal(true)}>발사</Button>
      <Modal open={showAdModal}>
        <h3>앱인토스 인앱광고 2.0</h3>
        <p>광고를 스킵하면 1회, 시청하면 5회 발사권을 드립니다.</p>
        <Button onClick={() => { setFireCount(fireCount + 1); setShowAdModal(false); }}>스킵하기</Button>
        <Button onClick={() => { setFireCount(fireCount + 5); setShowAdModal(false); }}>광고 시청</Button>
      </Modal>
      {fireCount > 0 && (
        <Button onClick={handleFire}>대포 발사</Button>
      )}
    </div>
  );
}

export default FireScreen;
