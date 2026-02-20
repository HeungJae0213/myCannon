import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WelcomeBall from '../components/WelcomeBall';
import CannonBody from '../components/CannonBody';
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
          <WelcomeBall number={7} size={200} />
        </div>
        <div className="cannon-body-area">
          <CannonBody width={450} height={300} />
        </div>
      </div>
      <div className="welcome-bottom">
        <button className="welcome-button" onClick={handleClick}>
          확인했어요
        </button>
      </div>
    </div>
  );
}

export default WelcomeScreen;
