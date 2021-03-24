import React, { useState, useEffect, useReducer, createContext } from 'react';
import throttle from 'lodash/throttle';
import './App.scss';
import {
  getNoteGroupTypeSelectionMap,
  getSelectedNoteGroupTypes,
  NoteGroupTypeSelectionMap,
  Octave,
  Pitch,
  PitchClass,
} from './modules/note';
import Score from './components/Score';
import { getRandomMeasures } from './modules/random';
import {
  getTimeSignature,
  TimeSignatureType,
  timeSignatures,
  TimeSignature,
} from './modules/time-signature';
import Header from './components/Header';
import SettingsMenu from './components/SettingsMenu';
import { ScoreData } from './modules/score';
import MainMenu from './components/MainMenu';
import { fromJS } from 'immutable';
import {
  getPersistedAppState,
  persistAppState,
} from './modules/persisted-state';
import {
  encodeScoreSettingsShareString,
  ShareStringEncodingVersion,
} from './modules/share';
import {
  EventAction,
  EventCategory,
  sendEvent,
  sendMetronomeEvent,
  sendPlaybackEvent,
} from './modules/events';
import { PlaybackState, startMetronome, stopMetronome } from './modules/tone';
import { MetronomeSettings } from './modules/metronome';
import {
  State,
  Action,
  reducer,
  createDispatchUpdateScoreSettings,
} from './modules/reducer';

export enum FormFactor {
  MOBILE,
  DESKTOP,
}

export type MeasureCount = 1 | 2 | 4 | 8;
export interface ScoreSettings {
  measureCount: MeasureCount;
  timeSignature: TimeSignature;
  noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap;
  tempo: number;
  pitch: Pitch;
  metronomeSettings: MetronomeSettings;
}

export interface AppProps {
  testMode?: boolean;
}

const CURRENT_SHARE_STRING_VERSION = ShareStringEncodingVersion._2;

export const MEASURE_COUNT_OPTIONS: MeasureCount[] = [1, 2, 4, 8];

// Application defaults
export const DEFAULT_MEASURE_COUNT = MEASURE_COUNT_OPTIONS[2];
export const DEFAULT_NOTE_GROUP_TYPE_SELECTION_MAP = getNoteGroupTypeSelectionMap();
export const DEFAULT_TIME_SIGNATURE = getTimeSignature(
  TimeSignatureType.SIMPLE_4_4
);
export const DEFAULT_TEMPO = 80; // bpm

export const DEFAULT_PITCH: Pitch = {
  pitchClass: PitchClass.F,
  octave: Octave._4,
};

export const DEFAULT_METRONOME_SETTINGS: MetronomeSettings = {
  active: false,
  countOffMeasures: 0,
  startOfMeasureClick: true,
  subdivisionClick: false,
};

export const DEFAULT_SCORE_SETTINGS: ScoreSettings = {
  measureCount: DEFAULT_MEASURE_COUNT,
  timeSignature: DEFAULT_TIME_SIGNATURE,
  noteGroupTypeSelectionMap: DEFAULT_NOTE_GROUP_TYPE_SELECTION_MAP,
  pitch: DEFAULT_PITCH,
  tempo: DEFAULT_TEMPO,
  metronomeSettings: DEFAULT_METRONOME_SETTINGS,
};

const THROTTLE_INTERVAL = 200; // ms
const TRANSITION_TIME = 500; // ms
const MOBILE_BREAKPOINT = 768; // px
const NOTE_TRIGGER_DELAY = 100; // ms
const SHARE_STRING_PARAM = 's';

export const AppContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
}>({
  state: { scoreSettings: DEFAULT_SCORE_SETTINGS },
  dispatch: () => null,
});

const App = ({ testMode = false }: AppProps) => {
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

  const [state, dispatch] = useReducer(reducer, {
    scoreSettings: DEFAULT_SCORE_SETTINGS,
  });

  const { scoreSettings } = state;

  const dispatchUpdateScoreSettings = createDispatchUpdateScoreSettings(
    dispatch
  );

  // Share string state
  const [shareString, setShareString] = useState<string>('');
  const [validationErrorMessage, setValidationErrorMessage] = useState('');
  const [shareStringErrorMessage, setShareStringErrorMessage] = useState('');

  // Score state
  const [scoreData, setScoreData] = useState({
    measures: [],
    timeSignature: scoreSettings.timeSignature,
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
  const [playingNoteIndex, setPlayingNoteIndex] = useState<number | null>(null);

  // Metronome states
  const [metronomeOn, setMetronomeOn] = useState(false);

  // Retrieve persisted app state
  useEffect(() => {
    const shareString = new URLSearchParams(window.location.search).get(
      SHARE_STRING_PARAM
    );

    const { scoreSettings, scoreData, errorMessage } = getPersistedAppState(
      shareString as string | undefined,
      testMode
    );

    // Only track that a share string was used if it is valid
    if (shareString && !errorMessage) {
      sendEvent(EventCategory.SHARE_LINK, EventAction.USED, shareString);
    }

    dispatchUpdateScoreSettings({
      measureCount: scoreSettings.measureCount,
      timeSignature: scoreSettings.timeSignature,
      noteGroupTypeSelectionMap: fromJS(
        scoreSettings.noteGroupTypeSelectionMap
      ),
      tempo: scoreSettings.tempo,
      pitch: scoreSettings.pitch,
      metronomeSettings: scoreSettings.metronomeSettings,
    });
    setScoreData(scoreData);

    if (errorMessage) {
      setSettingsMenuOpen(true);
      setShareStringErrorMessage(errorMessage);
      window.history.replaceState({}, document.title, '/');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist app state
  useEffect(() => {
    const scoreSettingsToPersist: ScoreSettings = {
      measureCount: scoreSettings.measureCount,
      timeSignature: scoreSettings.timeSignature,
      noteGroupTypeSelectionMap: scoreSettings.noteGroupTypeSelectionMap,
      tempo: scoreSettings.tempo,
      pitch: scoreSettings.pitch,
      metronomeSettings: scoreSettings.metronomeSettings,
    };

    persistAppState({ scoreSettings: scoreSettingsToPersist, scoreData });
  }, [scoreSettings, scoreData]);

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

    if (
      getSelectedNoteGroupTypes(
        scoreSettings.noteGroupTypeSelectionMap,
        scoreSettings.timeSignature
      ).length === 0
    ) {
      setValidationErrorMessage('Please select at least one type of note');
      return;
    }

    setValidationErrorMessage('');
  }, [scoreSettings]);

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
    const shareString = encodeScoreSettingsShareString(
      {
        measureCount: scoreSettings.measureCount,
        noteGroupTypeSelectionMap: scoreSettings.noteGroupTypeSelectionMap,
        timeSignature: scoreSettings.timeSignature,
        tempo: scoreSettings.tempo,
        pitch: scoreSettings.pitch,
        metronomeSettings: scoreSettings.metronomeSettings,
      },
      CURRENT_SHARE_STRING_VERSION
    );
    setShareString(shareString);
  }, [scoreSettings]);

  const setNextMeasures = () => {
    try {
      const nextMeasures = getRandomMeasures(
        scoreSettings.noteGroupTypeSelectionMap,
        scoreSettings.timeSignature,
        scoreSettings.measureCount,
        testMode
      );
      setScoreData({
        measures: nextMeasures,
        timeSignature: scoreSettings.timeSignature,
      });
    } catch (error) {
      setSettingsMenuOpen(true);
      setScoreData({
        measures: [],
        timeSignature: scoreSettings.timeSignature,
      });
      setValidationErrorMessage(
        'The combination of notes selected is not always valid for the given time signature'
      );
    }
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

    if (playbackState === PlaybackState.STOPPED) {
      setPlayingNoteIndex(null);
    }

    if (playbackState === PlaybackState.PLAYING) {
      sendPlaybackEvent(scoreSettings);
    }
  };

  const handleNoteTrigger = (index: number | null) => {
    setTimeout(() => {
      setPlayingNoteIndex(index);
    }, NOTE_TRIGGER_DELAY);
  };

  const handleMetronomeClickTrigger = () => {
    // Handler for future use cases of visually representing metronome clicks
  };

  const handleMetronomeButtonClick = () => {
    setMetronomeOn((currentMetronomeOn) => {
      if (!currentMetronomeOn) {
        startMetronome(
          scoreSettings.timeSignature,
          scoreSettings.metronomeSettings,
          handleMetronomeClickTrigger
        );
        sendMetronomeEvent(scoreSettings.metronomeSettings);
        return true;
      }

      stopMetronome();
      return false;
    });
  };

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <div className="c-rr-app">
        <SettingsMenu
          settingsMenuOpen={settingsMenuOpen}
          openAccordion={openSettingsAccordion}
          timeSignatures={timeSignatures}
          measureCountOptions={MEASURE_COUNT_OPTIONS}
          onSettingsMenuCloseClick={handleSettingsMenuCloseClick}
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
          metronomeOn={metronomeOn}
          onPlaybackStateChange={handlePlaybackStateChange}
          onNoteTrigger={handleNoteTrigger}
          onMetronomeClickTrigger={handleMetronomeClickTrigger}
          onMainMenuButtonClick={handleMainMenuButtonClick}
          onSettingsMenuButtonClick={handleSettingsMenuButtonClick}
          onRandomizeButtonClick={handleHeaderRandomizeButtonClick}
          onMetronomeButtonClick={handleMetronomeButtonClick}
        />
        <Score
          scoreData={scoreData}
          innerWidth={innerWidth}
          transitioning={transitioning}
          currentFormFactor={formFactor}
          playingNoteIndex={playingNoteIndex}
          onScoreClick={handleScoreRandomizeButtonClick}
        />
      </div>
    </AppContext.Provider>
  );
};

export default App;
