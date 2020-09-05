import React, { useState, useEffect } from 'react';
import throttle from 'lodash/throttle';
import './App.scss';
import {
  NoteGroupType,
  getNoteGroupTypeSelectionMap,
  getSelectedNoteGroupTypes,
} from './modules/note';
import Score from './components/Score';
import { getRandomMeasures } from './modules/random';
import { Measure } from './modules/vex';
import { getTimeSignature, TimeSignatureType } from './modules/time-signature';
import Header from './components/Header';
import SettingsMenu from './components/SettingsMenu';

const THROTTLE_INTERVAL = 200; // ms

const App = () => {
  const [measureCount, setMeasureCount] = useState(8);
  const [timeSignature, setTimeSignature] = useState(
    getTimeSignature(TimeSignatureType.SIMPLE_4_4)
  );
  const [innerWidth, setInnerWidth] = useState(window.innerWidth);
  const [noteGroupTypeSelectionMap, setNoteGroupTypeSelectionMap] = useState(
    getNoteGroupTypeSelectionMap()
  );
  const [errorMessage, setErrorMessage] = useState('');

  const [settingsMenuOpen, setSettingsMenuOpen] = useState(true);

  const [measures, setMeasures] = useState<Measure[]>([]);

  // TODO: Improve how initial state is set
  useEffect(() => {
    setNextMeasures();
  }, []); // eslint-disable-line

  // Handle resizing score on window resize
  useEffect(() => {
    const handleWindowResize = throttle(() => {
      setInnerWidth(window.innerWidth);
    }, THROTTLE_INTERVAL);

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  // Handle validating configuration and adding an error message
  useEffect(() => {
    // TODO: Do more robust checks here, including smarter validation of potentially impossible
    // selections

    if (getSelectedNoteGroupTypes(noteGroupTypeSelectionMap).length === 0) {
      setErrorMessage('Please select at least one type of note');
      return;
    }

    setErrorMessage('');
  }, [noteGroupTypeSelectionMap, timeSignature]);

  const setNextMeasures = () => {
    try {
      const nextMeasures = getRandomMeasures(
        noteGroupTypeSelectionMap,
        timeSignature.beatsPerMeasure,
        measureCount
      );
      setMeasures(nextMeasures);
    } catch (error) {
      setSettingsMenuOpen(true);
      setErrorMessage(
        'The combination of notes selected is not valid for the given time signature'
      );
    }
  };

  const handleRandomizeButtonClick = () => {
    setNextMeasures();
  };

  const handleSettingsMenuButtonClick = () => {
    setSettingsMenuOpen(true);
  };

  const handleSettingsMenuCloseClick = () => {
    setSettingsMenuOpen(false);
  };

  const handleNoteGroupChange = (
    noteGroupType: NoteGroupType,
    checked: boolean
  ) => {
    setNoteGroupTypeSelectionMap((previousNoteGroupTypeSelectionMap) => {
      return previousNoteGroupTypeSelectionMap.set(noteGroupType, checked);
    });
  };

  return (
    <div className="c-rr-app">
      <SettingsMenu
        settingsMenuOpen={settingsMenuOpen}
        noteGroupTypeSelectionMap={noteGroupTypeSelectionMap}
        onSettingsMenuCloseClick={handleSettingsMenuCloseClick}
        onNoteGroupChange={handleNoteGroupChange}
        errorMessage={errorMessage}
      />
      <Header
        onSettingsMenuButtonClick={handleSettingsMenuButtonClick}
        onRandomizeButtonClick={handleRandomizeButtonClick}
      />
      <Score
        timeSignature={timeSignature}
        measures={measures}
        innerWidth={innerWidth}
      />
    </div>
  );
};

export default App;
