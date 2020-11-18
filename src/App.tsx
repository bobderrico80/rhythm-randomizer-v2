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
import {
  getPersistedAppState,
  persistAppState,
} from './modules/persisted-state';
import { encodeScoreSettingsShareString } from './modules/share';
import { EventAction, EventCategory, sendEvent } from './modules/events';
import { PlaybackState } from './modules/tone';

export enum FormFactor {
  MOBILE,
  DESKTOP,
}

export interface ScoreSettings {
  measureCount: number;
  timeSignatureType: TimeSignatureType;
  noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap;
}

export const MEASURE_COUNT_OPTIONS = [1, 2, 4, 8];
const DEFAULT_TEMPO = 80; // bpm

const THROTTLE_INTERVAL = 200; // ms
const TRANSITION_TIME = 500; // ms
const MOBILE_BREAKPOINT = 768; // px

const SHARE_STRING_PARAM = 's';

const App = () => {
  // Menu/accordion states
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [
    lastFocusedElement,
    setLastFocusElement,
  ] = useState<HTMLElement | null>(null);
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
  const [shareString, setShareString] = useState<string>('');
  const [validationErrorMessage, setValidationErrorMessage] = useState('');
  const [shareStringErrorMessage, setShareStringErrorMessage] = useState('');

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

  // Player states
  const [playbackState, setPlaybackState] = useState<PlaybackState>(
    PlaybackState.STOPPED
  );
  const [tempo, setTempo] = useState(DEFAULT_TEMPO);

  // Retrieve persisted app state
  useEffect(() => {
    const shareString = new URLSearchParams(window.location.search).get(
      SHARE_STRING_PARAM
    );

    const { scoreSettings, scoreData, errorMessage } = getPersistedAppState(
      shareString as string | undefined
    );

    // Only track that a share string was used if it is valid
    if (shareString && !errorMessage) {
      sendEvent(EventCategory.SHARE_LINK, EventAction.USED, shareString);
    }

    setMeasureCount(scoreSettings.measureCount);
    setSelectedTimeSignature(getTimeSignature(scoreSettings.timeSignatureType));
    setNoteGroupTypeSelectionMap(
      fromJS(scoreSettings.noteGroupTypeSelectionMap)
    );
    setScoreData(scoreData);

    if (errorMessage) {
      setSettingsMenuOpen(true);
      setShareStringErrorMessage(errorMessage);
      window.history.replaceState({}, document.title, '/');
    }
  }, []);

  // Persist app state
  useEffect(() => {
    const scoreSettings: ScoreSettings = {
      measureCount,
      timeSignatureType: selectedTimeSignature.type,
      noteGroupTypeSelectionMap: noteGroupTypeSelectionMap,
    };

    persistAppState({ scoreSettings, scoreData });
  }, [
    measureCount,
    selectedTimeSignature,
    noteGroupTypeSelectionMap,
    scoreData,
  ]);

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
      setValidationErrorMessage('Please select at least one type of note');
      return;
    }

    setValidationErrorMessage('');
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

  // Generate share string state on settings update
  useEffect(() => {
    const shareString = encodeScoreSettingsShareString({
      measureCount,
      noteGroupTypeSelectionMap,
      timeSignatureType: selectedTimeSignature.type,
    });
    setShareString(shareString);
  }, [measureCount, noteGroupTypeSelectionMap, selectedTimeSignature]);

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
      setValidationErrorMessage(
        'The combination of notes selected is not always valid for the given time signature'
      );
    }
  };

  const setNextTimeSignature = (timeSignatureType: TimeSignatureType) => {
    setSelectedTimeSignature(getTimeSignature(timeSignatureType));
  };

  const handleHeaderRandomizeButtonClick = () => {
    sendEvent(EventCategory.HEADER_NAV, EventAction.NEW_RHYTHM, shareString);
    handleRandomizeButtonClick();
  };

  const handleScoreRandomizeButtonClick = () => {
    sendEvent(EventCategory.SCORE, EventAction.NEW_RHYTHM, shareString);
    handleRandomizeButtonClick();
  };

  const handleRandomizeButtonClick = () => {
    setTransitioning(true);
    setValidationErrorMessage('');
    window.setTimeout(() => {
      setNextMeasures();
      setTransitioning(false);
    }, TRANSITION_TIME);
  };

  const handleSettingsMenuButtonClick = () => {
    setLastFocusElement(document.activeElement as HTMLElement);
    setSettingsMenuOpen(true);
  };

  const handleMainMenuButtonClick = () => {
    setLastFocusElement(document.activeElement as HTMLElement);
    sendEvent(EventCategory.MAIN_MENU, EventAction.OPENED);
    setMainMenuOpen(true);
  };

  const handleSettingsMenuCloseClick = () => {
    setSettingsMenuOpen(false);
    setShareStringErrorMessage('');
    lastFocusedElement?.focus();
    setLastFocusElement(null);
  };

  const handleMainMenuCloseClick = () => {
    setMainMenuOpen(false);
    lastFocusedElement?.focus();
    setLastFocusElement(null);
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

  const handleShareLinkClick = () => {
    const shareUrl = `${window.location.origin}?s=${shareString}`;

    const textArea = document.createElement('textarea');
    textArea.value = shareUrl;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    document.execCommand('copy');
    document.body.removeChild(textArea);
    sendEvent(EventCategory.SHARE_LINK, EventAction.COPIED, shareString);
  };

  const handlePlaybackStateChange = (playbackState: PlaybackState) => {
    setPlaybackState(playbackState);
  };

  const handleTempoChange = (tempo: number) => {
    setTempo(tempo);
  };

  return (
    <div className="c-rr-app">
      <SettingsMenu
        settingsMenuOpen={settingsMenuOpen}
        openAccordion={openSettingsAccordion}
        tempo={tempo}
        noteGroupTypeSelectionMap={noteGroupTypeSelectionMap}
        timeSignatures={timeSignatures}
        selectedTimeSignature={selectedTimeSignature}
        measureCountOptions={MEASURE_COUNT_OPTIONS}
        selectedMeasureCount={measureCount}
        onSettingsMenuCloseClick={handleSettingsMenuCloseClick}
        onTempoChange={handleTempoChange}
        onNoteGroupChange={handleNoteGroupChange}
        onNoteGroupMultiSelectChange={handleNoteGroupMultiSelectChange}
        onTimeSignatureChange={handleTimeSignatureChange}
        onMeasureCountChange={handleMeasureCountChange}
        errorMessage={validationErrorMessage || shareStringErrorMessage}
        onOpenAccordionChange={handleSettingsOpenAccordionChange}
        onShareLinkClick={handleShareLinkClick}
      />
      <MainMenu
        mainMenuOpen={mainMenuOpen}
        onMainMenuCloseClick={handleMainMenuCloseClick}
      />
      <Header
        currentFormFactor={formFactor}
        measures={scoreData.measures}
        playbackState={playbackState}
        tempo={tempo}
        onPlaybackStateChange={handlePlaybackStateChange}
        onMainMenuButtonClick={handleMainMenuButtonClick}
        onSettingsMenuButtonClick={handleSettingsMenuButtonClick}
        onRandomizeButtonClick={handleHeaderRandomizeButtonClick}
      />
      <Score
        scoreData={scoreData}
        innerWidth={innerWidth}
        transitioning={transitioning}
        currentFormFactor={formFactor}
        onScoreClick={handleScoreRandomizeButtonClick}
      />
    </div>
  );
};

export default App;
