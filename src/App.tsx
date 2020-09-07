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
import {
  getTimeSignature,
  TimeSignatureType,
  timeSignatures,
} from './modules/time-signature';
import Header from './components/Header';
import SettingsMenu from './components/SettingsMenu';
import { ScoreData } from './modules/score';

const THROTTLE_INTERVAL = 200; // ms
const MEASURE_COUNT_OPTIONS = [1, 2, 4, 8];

const App = () => {
  const [measureCount, setMeasureCount] = useState(2);
  const [selectedTimeSignature, setSelectedTimeSignature] = useState(
    getTimeSignature(TimeSignatureType.SIMPLE_4_4)
  );
  const [innerWidth, setInnerWidth] = useState(window.innerWidth);
  const [noteGroupTypeSelectionMap, setNoteGroupTypeSelectionMap] = useState(
    getNoteGroupTypeSelectionMap(selectedTimeSignature.beatsPerMeasure)
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [scoreData, setScoreData] = useState({
    measures: [],
    timeSignature: selectedTimeSignature,
  } as ScoreData);

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
  }, [noteGroupTypeSelectionMap, selectedTimeSignature]);

  // Handle reconfiguring selection map when time signature changes
  useEffect(() => {
    setNoteGroupTypeSelectionMap((oldMap) => {
      let newMap = getNoteGroupTypeSelectionMap(
        selectedTimeSignature.beatsPerMeasure
      );

      [...oldMap.entries()].forEach(([noteGroupType, checked]) => {
        if (newMap.has(noteGroupType)) {
          newMap = newMap.set(noteGroupType, checked);
        }
      });

      return newMap;
    });
  }, [selectedTimeSignature]);

  const setNextMeasures = () => {
    try {
      const nextMeasures = getRandomMeasures(
        noteGroupTypeSelectionMap,
        selectedTimeSignature.beatsPerMeasure,
        measureCount
      );
      setScoreData({
        measures: nextMeasures,
        timeSignature: selectedTimeSignature,
      });
    } catch (error) {
      setSettingsMenuOpen(true);
      setErrorMessage(
        'The combination of notes selected is not valid for the given time signature'
      );
    }
  };

  const setNextTimeSignature = (timeSignatureType: TimeSignatureType) => {
    setSelectedTimeSignature(getTimeSignature(timeSignatureType));
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

  const handleTimeSignatureChange = (timeSignatureType: TimeSignatureType) => {
    setNextTimeSignature(timeSignatureType);
  };

  const handleMeasureCountChange = (measureCount: number) => {
    setMeasureCount(measureCount);
  };

  return (
    <div className="c-rr-app">
      <SettingsMenu
        settingsMenuOpen={settingsMenuOpen}
        noteGroupTypeSelectionMap={noteGroupTypeSelectionMap}
        timeSignatures={timeSignatures}
        selectedTimeSignature={selectedTimeSignature}
        measureCountOptions={MEASURE_COUNT_OPTIONS}
        selectedMeasureCount={measureCount}
        onSettingsMenuCloseClick={handleSettingsMenuCloseClick}
        onNoteGroupChange={handleNoteGroupChange}
        onTimeSignatureChange={handleTimeSignatureChange}
        onMeasureCountChange={handleMeasureCountChange}
        errorMessage={errorMessage}
      />
      <Header
        onSettingsMenuButtonClick={handleSettingsMenuButtonClick}
        onRandomizeButtonClick={handleRandomizeButtonClick}
      />
      <Score scoreData={scoreData} innerWidth={innerWidth} />
    </div>
  );
};

export default App;
