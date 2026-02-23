

// 대포 본체(이미지) 컴포넌트
// - width, height 조절 가능
interface CannonBodyProps {
  width?: number;
  height?: number;
}

const CannonBody = ({ width = 220, height = 120 }: CannonBodyProps) => (
  // 대포 이미지를 중앙에 표시
  <img
    src="/cannon.png"
    alt="Cannon"
    width={width}
    height={height}
    style={{ display: 'block', margin: '0 auto', objectFit: 'contain' }}
  />
);

export default CannonBody;
