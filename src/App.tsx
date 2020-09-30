import React, { useState, useEffect } from 'react';
import throttle from 'lodash/throttle';
import './App.scss';
import {
  NoteGroupType,
  getNoteGroupTypeSelectionMap,
  getSelectedNoteGroupTypes,
  NoteGroupCategory,
  getNoteGroup,
  NoteGroupTypeSelectionMap,
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
import { MultiSelectStatusType } from './components/NoteCheckboxGroup';
import MainMenu from './components/MainMenu';
import { fromJS } from 'immutable';

export enum FormFactor {
  MOBILE,
  DESKTOP,
}

enum LocalStorageKey {
  SCORE_SETTINGS = 'rr.scoreSettings',
  SCORE_DATA = 'rr.scoreData',
}

interface ScoreSettings {
  measureCount: number;
  timeSignatureType: TimeSignatureType;
  noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap;
}

const THROTTLE_INTERVAL = 200; // ms
const TRANSITION_TIME = 500; // ms
const MEASURE_COUNT_OPTIONS = [1, 2, 4, 8];
const MOBILE_BREAKPOINT = 768; // px

const App = () => {
  // Menu/accordion states
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [mainMenuOpen, setMainMenuOpen] = useState(false);
  const [openSettingsAccordion, setOpenSettingsAccordion] = useState(
    'note-selection-accordion'
  );

  // Score selection settings
  const [measureCount, setMeasureCount] = useState(2);
  const [selectedTimeSignature, setSelectedTimeSignature] = useState(
    getTimeSignature(TimeSignatureType.SIMPLE_4_4)
  );
  const [noteGroupTypeSelectionMap, setNoteGroupTypeSelectionMap] = useState(
    getNoteGroupTypeSelectionMap(selectedTimeSignature.beatsPerMeasure)
  );
  const [errorMessage, setErrorMessage] = useState('');

  // Score state
  const [scoreData, setScoreData] = useState({
    measures: [],
    timeSignature: selectedTimeSignature,
  } as ScoreData);
  const [transitioning, setTransitioning] = useState(false);

  // Page dimension states
  const [innerWidth, setInnerWidth] = useState(window.innerWidth);
  const [formFactor, setFormFactor] = useState<FormFactor>(
    window.innerWidth > MOBILE_BREAKPOINT
      ? FormFactor.DESKTOP
      : FormFactor.MOBILE
  );

  // Save score settings to local storage
  useEffect(() => {
    const scoreSettingsJson = window.localStorage.getItem(
      LocalStorageKey.SCORE_SETTINGS
    );
    const scoreDataJson = window.localStorage.getItem(
      LocalStorageKey.SCORE_DATA
    );
    if (scoreSettingsJson && scoreDataJson) {
      const scoreSettings = JSON.parse(scoreSettingsJson) as ScoreSettings;
      const scoreData = JSON.parse(scoreDataJson) as ScoreData;

      setMeasureCount(scoreSettings.measureCount);
      setSelectedTimeSignature(
        getTimeSignature(scoreSettings.timeSignatureType)
      );
      setNoteGroupTypeSelectionMap(
        fromJS(scoreSettings.noteGroupTypeSelectionMap)
      );
      setScoreData(scoreData);
    } else {
      setNextMeasures();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Save score data to local storage
  useEffect(() => {
    const scoreSettings = {
      measureCount,
      timeSignatureType: selectedTimeSignature.type,
      noteGroupTypeSelectionMap: noteGroupTypeSelectionMap.toJS(),
    };

    localStorage.setItem(
      LocalStorageKey.SCORE_SETTINGS,
      JSON.stringify(scoreSettings)
    );
  }, [measureCount, selectedTimeSignature, noteGroupTypeSelectionMap]);

  useEffect(() => {
    localStorage.setItem(LocalStorageKey.SCORE_DATA, JSON.stringify(scoreData));
  }, [scoreData]);

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

  // Update form factor value based on media query
  useEffect(() => {
    const handleMatchMediaChange = (event: MediaQueryListEvent) => {
      setFormFactor(event.matches ? FormFactor.MOBILE : FormFactor.DESKTOP);
    };

    const mediaQueryList = window.matchMedia(
      `(max-width: ${MOBILE_BREAKPOINT}px)`
    );
    mediaQueryList.addListener(handleMatchMediaChange);

    return () => {
      mediaQueryList.removeListener(handleMatchMediaChange);
    };
  }, []);

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
      setScoreData({ measures: [], timeSignature: selectedTimeSignature });
      setErrorMessage(
        'The combination of notes selected is not always valid for the given time signature'
      );
    }
  };

  const setNextTimeSignature = (timeSignatureType: TimeSignatureType) => {
    setSelectedTimeSignature(getTimeSignature(timeSignatureType));
  };

  const handleRandomizeButtonClick = () => {
    setTransitioning(true);
    setErrorMessage('');
    window.setTimeout(() => {
      setNextMeasures();
      setTransitioning(false);
    }, TRANSITION_TIME);
  };

  const handleSettingsMenuButtonClick = () => {
    setSettingsMenuOpen(true);
  };

  const handleMainMenuButtonClick = () => {
    setMainMenuOpen(true);
  };

  const handleSettingsMenuCloseClick = () => {
    setSettingsMenuOpen(false);
  };

  const handleMainMenuCloseClick = () => {
    setMainMenuOpen(false);
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

  const handleNoteGroupMultiSelectChange = (
    category: NoteGroupCategory,
    multiSelectStatusType: MultiSelectStatusType
  ) => {
    setNoteGroupTypeSelectionMap((previousNoteGroupTypeSelectionMap) => {
      let nextNoteGroupTypeSelectionMap = previousNoteGroupTypeSelectionMap;

      previousNoteGroupTypeSelectionMap.forEach((_, noteGroupType) => {
        const noteGroup = getNoteGroup(noteGroupType);

        if (noteGroup.categoryType === category.type) {
          const checked =
            multiSelectStatusType === MultiSelectStatusType.SELECT_ALL;
          nextNoteGroupTypeSelectionMap = nextNoteGroupTypeSelectionMap.set(
            noteGroupType,
            checked
          );
        }
      });

      return nextNoteGroupTypeSelectionMap;
    });
  };

  const handleSettingsOpenAccordionChange = (openedAccordion: string) => {
    setOpenSettingsAccordion(openedAccordion);
  };

  return (
    <div className="c-rr-app">
      <SettingsMenu
        settingsMenuOpen={settingsMenuOpen}
        openAccordion={openSettingsAccordion}
        noteGroupTypeSelectionMap={noteGroupTypeSelectionMap}
        timeSignatures={timeSignatures}
        selectedTimeSignature={selectedTimeSignature}
        measureCountOptions={MEASURE_COUNT_OPTIONS}
        selectedMeasureCount={measureCount}
        onSettingsMenuCloseClick={handleSettingsMenuCloseClick}
        onNoteGroupChange={handleNoteGroupChange}
        onNoteGroupMultiSelectChange={handleNoteGroupMultiSelectChange}
        onTimeSignatureChange={handleTimeSignatureChange}
        onMeasureCountChange={handleMeasureCountChange}
        errorMessage={errorMessage}
        onOpenAccordionChange={handleSettingsOpenAccordionChange}
      />
      <MainMenu
        mainMenuOpen={mainMenuOpen}
        onMainMenuCloseClick={handleMainMenuCloseClick}
      />
      <Header
        currentFormFactor={formFactor}
        onMainMenuButtonClick={handleMainMenuButtonClick}
        onSettingsMenuButtonClick={handleSettingsMenuButtonClick}
        onRandomizeButtonClick={handleRandomizeButtonClick}
      />
      <Score
        scoreData={scoreData}
        innerWidth={innerWidth}
        transitioning={transitioning}
        currentFormFactor={formFactor}
        onScoreClick={handleRandomizeButtonClick}
      />
    </div>
  );
};

export default App;
