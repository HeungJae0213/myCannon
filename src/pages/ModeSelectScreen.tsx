import CannonBody from '../components/CannonBody';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Selector } from '@toss/tds-mobile';

function ModeSelectScreen() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('');
  const [singleNumbers, setSingleNumbers] = useState('');
  const [rangeMin, setRangeMin] = useState('');
  const [rangeMax, setRangeMax] = useState('');

  return (
    <div className="mode-select-screen">
      <CannonBody width={160} height={90} />
      <h2>모드를 선택해주세요</h2>
      <Selector
        items={[{ value: 'single', label: '단일 숫자' }, { value: 'range', label: '범위 숫자' }]}
        selectedValue={mode}
        typography="t1"
        onChange={event => setMode(event.currentTarget.dataset.value || '')}
      />
      {mode === 'single' && (
        <TextField
          variant="line"
          placeholder="숫자를 입력하세요"
          value={singleNumbers}
          onChange={e => setSingleNumbers(e.target.value)}
        />
      )}
      {mode === 'range' && (
        <div>
          <TextField
            variant="line"
            placeholder="최소값"
            value={rangeMin}
            onChange={e => setRangeMin(e.target.value)}
          />
          <TextField
            variant="line"
            placeholder="최대값"
            value={rangeMax}
            onChange={e => setRangeMax(e.target.value)}
          />
        </div>
      )}
      <Button onClick={() => navigate('/fire', { state: { mode, singleNumbers, rangeMin, rangeMax } })}>확인</Button>
    </div>
  );
}

export default ModeSelectScreen;
