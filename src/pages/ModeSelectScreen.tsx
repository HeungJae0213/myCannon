
import CannonBody from '../components/CannonBody';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ModeSelectScreen.css';

function ModeSelectScreen() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('');
  const [singleCount, setSingleCount] = useState('');
  const [rangeMin, setRangeMin] = useState('');
  const [rangeMax, setRangeMax] = useState('');
  const [allowDuplicate, setAllowDuplicate] = useState(false);

  return (
    <div className="mode-select-screen">
      <div className="mode-select-title-bar">
        <div className="mode-select-title-bg">
          <span className="mode-select-title-text">모드를 선택해주세요</span>
        </div>
      </div>
      <div className="mode-select-cannon-area">
        <CannonBody width={500} height={230} />
      </div>
      <div className="mode-select-content">
        <div className="mode-select-mode-buttons">
          <button
            className={`mode-select-mode-btn${mode === 'single' ? ' selected' : ''}`}
            onClick={() => setMode('single')}
          >
            단일 숫자
          </button>
          <button
            className={`mode-select-mode-btn${mode === 'range' ? ' selected' : ''}`}
            onClick={() => setMode('range')}
          >
            범위 숫자
          </button>
        </div>
        {mode === 'single' && (
          <div className="mode-select-input-group">
            <input
              type="number"
              placeholder="공 갯수"
              value={singleCount}
              onChange={e => setSingleCount(e.target.value)}
              className="mode-select-input"
            />
            <label className="mode-select-checkbox-label">
              <input
                type="checkbox"
                checked={allowDuplicate}
                onChange={e => setAllowDuplicate(e.target.checked)}
                className="mode-select-checkbox"
              />
              중복번호 허용
            </label>
          </div>
        )}
        {mode === 'range' && (
          <div className="mode-select-input-group">
            <input
              type="number"
              placeholder="공 최소값"
              value={rangeMin}
              onChange={e => setRangeMin(e.target.value)}
              className="mode-select-input"
            />
            <input
              type="number"
              placeholder="공 최대값"
              value={rangeMax}
              onChange={e => setRangeMax(e.target.value)}
              className="mode-select-input"
            />
            <label className="mode-select-checkbox-label">
              <input
                type="checkbox"
                checked={allowDuplicate}
                onChange={e => setAllowDuplicate(e.target.checked)}
                className="mode-select-checkbox"
              />
              중복번호 허용
            </label>
          </div>
        )}
      </div>
      <div className="mode-select-bottom">
        <button
          className="mode-select-start-btn"
          onClick={() => navigate('/fire', { state: { mode, singleCount, rangeMin, rangeMax, allowDuplicate } })}
        >
          시작하기
        </button>
      </div>
    </div>
  );
}

export default ModeSelectScreen;
