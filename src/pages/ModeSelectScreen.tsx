
import CannonBody from '../components/CannonBody';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/ModeSelectScreen.css';


function ModeSelectScreen() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('');
  const [singleCount, setSingleCount] = useState('');
  const [rangeMin, setRangeMin] = useState('');
  const [rangeMax, setRangeMax] = useState('');
  const [allowDuplicate, setAllowDuplicate] = useState(false);
  // touched states for validation
  const [singleTouched, setSingleTouched] = useState(false);
  const [rangeMinTouched, setRangeMinTouched] = useState(false);
  const [rangeMaxTouched, setRangeMaxTouched] = useState(false);
  const [modeTouched, setModeTouched] = useState(false);

  // UX writing (Toss style)
  const singleCountError = singleTouched && !singleCount ? '공 갯수를 입력해 주세요' : '';
  const rangeMinError = rangeMinTouched && !rangeMin ? '공 최소값을 입력해 주세요' : '';
  const rangeMaxError = rangeMaxTouched && !rangeMax ? '공 최대값을 입력해 주세요' : '';
  const modeError = modeTouched && !mode ? '모드를 선택해 주세요' : '';

  const isStartDisabled = !mode;

  return (
    <div className="mode-select-screen">
      <div className="mode-select-title-bar">
        <div className="mode-select-title-bg">
          <span className="mode-select-title-text">모드를 선택해주세요</span>
        </div>
      </div>
      <div className="mode-select-cannon-area">
        <CannonBody width={500} height={150} />
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
        {modeError && (
          <div className="mode-select-error-text">{modeError}</div>
        )}
        {mode === 'single' && (
          <div className="mode-select-input-group">
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="공 갯수"
              value={singleCount}
              onChange={e => setSingleCount(e.target.value.replace(/[^0-9]/g, ''))}
              onBlur={() => setSingleTouched(true)}
              className="mode-select-input"
              required
            />
            {singleCountError && (
              <div className="mode-select-error-text">{singleCountError}</div>
            )}
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
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="공 최소값"
              value={rangeMin}
              onChange={e => setRangeMin(e.target.value.replace(/[^0-9]/g, ''))}
              onBlur={() => setRangeMinTouched(true)}
              className="mode-select-input"
              required
            />
            {rangeMinError && (
              <div className="mode-select-error-text">{rangeMinError}</div>
            )}
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="공 최대값"
              value={rangeMax}
              onChange={e => setRangeMax(e.target.value.replace(/[^0-9]/g, ''))}
              onBlur={() => setRangeMaxTouched(true)}
              className="mode-select-input"
              required
            />
            {rangeMaxError && (
              <div className="mode-select-error-text">{rangeMaxError}</div>
            )}
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
          style={isStartDisabled ? { background: '#e0e0e0', color: '#aaa', cursor: 'not-allowed' } : {}}
          disabled={isStartDisabled}
          onClick={() => {
            if (!mode) {
              setModeTouched(true);
              return;
            }
            if (
              (mode === 'single' && !singleCount) ||
              (mode === 'range' && (!rangeMin || !rangeMax))
            ) {
              setSingleTouched(true);
              setRangeMinTouched(true);
              setRangeMaxTouched(true);
              return;
            }
            navigate('/result', { state: { mode, singleCount, rangeMin, rangeMax, allowDuplicate } });
          }}
        >
          시작하기
        </button>
      </div>
    </div>
  );
}

export default ModeSelectScreen;
