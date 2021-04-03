import React, { useContext } from 'react';
import { buildBemClassName } from '../modules/util';
import { AppContext } from '../App';
import { createDispatchUpdateScoreSettings } from '../modules/reducer';
import Checkbox from './Checkbox';
import Select from './Select';
import { useTranslation } from 'react-i18next';

const buildClassName = buildBemClassName('c-rr-metronome-control');

const MetronomeControl = () => {
  const { t } = useTranslation();
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
        renderLabel={() => <>{t('playMetronomeDuringPlayback')}</>}
      />
      <Checkbox
        id="startOfMeasureClick"
        checked={startOfMeasureClick}
        onChange={handleCheckboxChange}
        renderLabel={() => <>{t('startOfMeasureClick')}</>}
      />
      <Checkbox
        id="subdivisionClick"
        checked={subdivisionClick}
        onChange={handleCheckboxChange}
        renderLabel={() => <>{t('subdivisionClick')}</>}
      />
      <Select
        id="countOffMeasures"
        label={t('countOffClick')}
        value={countOffMeasures.toString()}
        onChange={handleCountOffMeasuresChange}
        options={[
          { value: '0', display: t('off') },
          { value: '1', display: t('oneMeasure') },
          { value: '2', display: t('twoMeasures') },
        ]}
      />
    </div>
  );
};

export default MetronomeControl;
