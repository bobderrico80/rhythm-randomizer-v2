import React, { useContext } from 'react';
import { buildBemClassName } from '../modules/util';
import Select from './Select';
import './PitchControl.scss';
import { PitchClass, Octave } from '../modules/note-definition';
import { AppContext } from '../App';
import { createDispatchUpdateScoreSettings } from '../modules/reducer';
import { useTranslation } from 'react-i18next';

const pitchClassDisplayMap: { [key: string]: string } = {
  [PitchClass.A]: 'pitchClassA',
  [PitchClass.Bb]: 'pitchClassBb',
  [PitchClass.B]: 'pitchClassB',
  [PitchClass.C]: 'pitchClassC',
  [PitchClass.Db]: 'pitchClassDb',
  [PitchClass.D]: 'pitchClassD',
  [PitchClass.Eb]: 'pitchClassEb',
  [PitchClass.E]: 'pitchClassE',
  [PitchClass.F]: 'pitchClassF',
  [PitchClass.Gb]: 'pitchClassGb',
  [PitchClass.G]: 'pitchClassG',
  [PitchClass.Ab]: 'pitchClassAb',
};

const octaveDisplayMap: { [key: string]: string } = {
  [Octave._0]: 'octave0',
  [Octave._1]: 'octave1',
  [Octave._2]: 'octave2',
  [Octave._3]: 'octave3',
  [Octave._4]: 'octave4',
  [Octave._5]: 'octave5',
  [Octave._6]: 'octave6',
  [Octave._7]: 'octave7',
};

const buildClassName = buildBemClassName('c-rr-pitch-control');

const PitchControl = () => {
  const { t } = useTranslation();
  const { state, dispatch } = useContext(AppContext);

  const { pitch } = state.scoreSettings;

  const dispatchUpdateScoreSettings = createDispatchUpdateScoreSettings(
    dispatch
  );

  const handlePitchClassChange = (newPitch: string) => {
    dispatchUpdateScoreSettings({
      pitch: {
        pitchClass: newPitch as PitchClass,
        octave: pitch.octave,
      },
    });
  };

  const handleOctaveChange = (newOctave: string) => {
    dispatchUpdateScoreSettings({
      pitch: {
        pitchClass: pitch.pitchClass,
        octave: newOctave as Octave,
      },
    });
  };

  return (
    <div className={buildClassName()()}>
      <Select
        id="pitch-class"
        label={`${t('pitch')}:`}
        value={pitch.pitchClass}
        onChange={handlePitchClassChange}
        options={Object.entries(
          pitchClassDisplayMap
        ).map(([value, display]) => ({ value, display: t(display) }))}
      />
      <Select
        id="octave"
        label={`${t('octave')}:`}
        value={pitch.octave}
        onChange={handleOctaveChange}
        options={Object.entries(octaveDisplayMap).map(([value, display]) => ({
          value,
          display: t(display),
        }))}
      />
    </div>
  );
};

export default PitchControl;
