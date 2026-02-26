// 앱 첫 화면(웰컴/시작 화면)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WelcomeBall from '../components/WelcomeBall';
import CannonBody from '../components/CannonBody';
// 웰컴 화면 렌더링 및 시작 버튼 클릭 처리
function WelcomeScreen() {
  const navigate = useNavigate();
  const [fadeOut, setFadeOut] = useState(false);

  const handleClick = () => {
    setFadeOut(true);
    setTimeout(() => {
      navigate('/mode');
    }, 120);
  };

  return (
    <>
      <div className={`welcome-screen${fadeOut ? ' fade-out' : ''}`}>
      <div className="welcome-title-bar">
        <div className="welcome-title-bg">
          <span className="welcome-title-text">
            대포 뽑기에 오신걸 환영해요
          </span>
        </div>
      </div>
      <div className="welcome-content">
        <div className="welcome-ball-area">
          <WelcomeBall number={7} size={160} /> {/* 공 크기 줄임 */}
        </div>
        <div className="cannon-body-area">
          <CannonBody width={400} height={250} /> {/* 대포 크기 줄임 */}
        </div>
      </div>
      <div className="welcome-bottom">
        <button className="welcome-button" onClick={handleClick}>
          확인했어요
        </button>
      </div>
      </div>
    </>
  );
}

export default WelcomeScreen;
