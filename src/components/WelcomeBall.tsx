
// WelcomeBall(메인 화면/결과 공) 컴포넌트
// - number: 표시할 숫자, size: 공 크기
import '../assets/WelcomeBall.css';

interface WelcomeBallProps {
  number?: number;
  size?: number;
}

const WelcomeBall = ({ number, size = 220 }: WelcomeBallProps) => {
  // number가 있으면 숫자 표시, size로 크기 조절
  return (
    <div className="welcome-ball-3d" style={{ width: size, height: size }}>
      {number !== undefined && (
        <div className="welcome-ball-number">
          <span>{number}</span>
        </div>
      )}
    </div>
  );
};

export default WelcomeBall;
