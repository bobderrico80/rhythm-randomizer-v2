import React, { useContext } from 'react';
import { buildBemClassName } from '../modules/util';
import { AppContext } from '../App';
import { createDispatchUpdateScoreSettings } from '../modules/reducer';
import Checkbox from './Checkbox';
import Select from './Select';

const buildClassName = buildBemClassName('c-rr-metronome-control');

const MetronomeControl = () => {
  const { state, dispatch } = useContext(AppContext);

  const { metronomeSettings } = state.scoreSettings;

  const {
    active,
    startOfMeasureClick,
    subdivisionClick,
    countOffMeasures,
  } = metronomeSettings;

  const dispatchUpdateScoreSettings = createDispatchUpdateScoreSettings(
    dispatch
  );

  const handleCheckboxChange = (checked: boolean, id: string) => {
    dispatchUpdateScoreSettings({
      metronomeSettings: {
        ...metronomeSettings,
        [id]: checked,
      },
    });
  };

  const handleCountOffMeasuresChange = (value: string) => {
    dispatchUpdateScoreSettings({
      metronomeSettings: {
        ...metronomeSettings,
        countOffMeasures: parseInt(value, 10),
      },
    });
  };

  return (
    <div className={buildClassName()()}>
      <Checkbox
        id="active"
        checked={active}
        onChange={handleCheckboxChange}
        renderLabel={() => <>Play metronome during playback</>}
      />
      <Checkbox
        id="startOfMeasureClick"
        checked={startOfMeasureClick}
        onChange={handleCheckboxChange}
        renderLabel={() => <>Start-of-measure click</>}
      />
      <Checkbox
        id="subdivisionClick"
        checked={subdivisionClick}
        onChange={handleCheckboxChange}
        renderLabel={() => <>Subdivision click</>}
      />
      <Select
        id="countOffMeasures"
        label="Count-off click:"
        value={countOffMeasures.toString()}
        onChange={handleCountOffMeasuresChange}
        options={[
          { value: '0', display: 'Off ' },
          { value: '1', display: '1 Measure' },
          { value: '2', display: '2 Measures' },
        ]}
      />
    </div>
  );
};

export default MetronomeControl;
