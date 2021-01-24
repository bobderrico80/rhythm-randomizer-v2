import React, { useContext } from 'react';
import { buildBemClassName } from '../modules/util';
import Select from './Select';
import './PitchControl.scss';
import { PitchClass, Octave } from '../modules/note';
import { AppContext } from '../App';
import { createDispatchUpdateScoreSettings } from '../modules/reducer';

const pitchClassDisplayMap: { [key: string]: string } = {
  [PitchClass.A]: 'A',
  [PitchClass.Bb]: 'A♯/B♭',
  [PitchClass.B]: 'B',
  [PitchClass.C]: 'C',
  [PitchClass.Db]: 'C♯/D♭',
  [PitchClass.D]: 'D',
  [PitchClass.Eb]: 'D♯/E♭',
  [PitchClass.E]: 'E',
  [PitchClass.F]: 'F',
  [PitchClass.Gb]: 'F♯/G♭',
  [PitchClass.G]: 'G',
  [PitchClass.Ab]: 'G♯/A♭',
};

const octaveDisplayMap: { [key: string]: string } = {
  [Octave._0]: '0',
  [Octave._1]: '1',
  [Octave._2]: '2',
  [Octave._3]: '3',
  [Octave._4]: '4',
  [Octave._5]: '5',
  [Octave._6]: '6',
  [Octave._7]: '7',
};

const buildClassName = buildBemClassName('c-rr-pitch-control');

const PitchControl = () => {
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
        label="Pitch:"
        value={pitch.pitchClass}
        onChange={handlePitchClassChange}
        options={Object.entries(
          pitchClassDisplayMap
        ).map(([value, display]) => ({ value, display }))}
      />
      <Select
        id="octave"
        label="Octave:"
        value={pitch.octave}
        onChange={handleOctaveChange}
        options={Object.entries(octaveDisplayMap).map(([value, display]) => ({
          value,
          display,
        }))}
      />
    </div>
  );
};

export default PitchControl;
