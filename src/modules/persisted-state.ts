import { Map } from 'immutable';
import { DEFAULT_PITCH, DEFAULT_TEMPO, ScoreSettings } from '../App';
import { getNoteGroupTypeSelectionMap } from './note';
import { getRandomMeasures } from './random';
import { ScoreData } from './score';
import { decodeScoreSettingsShareString } from './share';
import { getTimeSignature, TimeSignatureType } from './time-signature';
import { Pitch } from './tone';
import { tryOrNull } from './util';

const logger = console;
const { localStorage } = window;

export interface PersistedAppState {
  scoreSettings: ScoreSettings;
  scoreData: ScoreData;
  errorMessage?: string;
}

enum LocalStorageKey {
  SCORE_SETTINGS = 'rr.scoreSettings',
  SCORE_DATA = 'rr.scoreData',
}

const getFromLocalStorage = <T>(key: LocalStorageKey): T | null => {
  const json = localStorage.getItem(key);

  if (json === null) {
    return json;
  }

  return JSON.parse(json);
};

const compareScoreSettings = (
  scoreSettingsA: ScoreSettings | null,
  scoreSettingsB: ScoreSettings | null
): boolean => {
  if (scoreSettingsA === null && scoreSettingsB === null) {
    return true;
  }

  if (scoreSettingsA === null || scoreSettingsB === null) {
    return false;
  }

  if (scoreSettingsA.timeSignatureType !== scoreSettingsB.timeSignatureType) {
    return false;
  }

  if (scoreSettingsA.measureCount !== scoreSettingsB.measureCount) {
    return false;
  }

  if (scoreSettingsA.tempo !== scoreSettingsB.tempo) {
    return false;
  }

  if (scoreSettingsA.pitch.pitchClass !== scoreSettingsB.pitch.pitchClass) {
    return false;
  }

  if (scoreSettingsA.pitch.octave !== scoreSettingsB.pitch.octave) {
    return false;
  }

  if (
    scoreSettingsA.noteGroupTypeSelectionMap.size !==
    scoreSettingsB.noteGroupTypeSelectionMap.size
  ) {
    return false;
  }

  return [...scoreSettingsA.noteGroupTypeSelectionMap.entries()].every(
    ([noteGroupType, checked]) => {
      return (
        scoreSettingsB.noteGroupTypeSelectionMap.get(noteGroupType) === checked
      );
    }
  );
};

const setToLocalStorage = <T>(key: LocalStorageKey, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

const getFreshScoreData = (scoreSettings: ScoreSettings): ScoreData => {
  const timeSignature = getTimeSignature(scoreSettings.timeSignatureType);
  return {
    timeSignature,
    measures: getRandomMeasures(
      scoreSettings.noteGroupTypeSelectionMap,
      timeSignature.beatsPerMeasure,
      scoreSettings.measureCount
    ),
  };
};

const getDefaultPersistedAppState = (): PersistedAppState => {
  const measureCount = 2;
  const timeSignature = getTimeSignature(TimeSignatureType.SIMPLE_4_4);
  const noteGroupTypeSelectionMap = getNoteGroupTypeSelectionMap(
    timeSignature.beatsPerMeasure
  );
  const tempo = DEFAULT_TEMPO;
  const pitch: Pitch = DEFAULT_PITCH;

  const scoreSettings = {
    measureCount,
    timeSignatureType: timeSignature.type,
    noteGroupTypeSelectionMap,
    tempo,
    pitch,
  };

  return {
    scoreSettings,
    scoreData: getFreshScoreData(scoreSettings),
  };
};

const getPersistedScoreSettings = () =>
  tryOrNull<ScoreSettings | null>(() => {
    const scoreSettings = getFromLocalStorage<ScoreSettings>(
      LocalStorageKey.SCORE_SETTINGS
    );

    if (!scoreSettings) {
      return null;
    }

    if (!scoreSettings.tempo) {
      scoreSettings.tempo = DEFAULT_TEMPO;
    }

    if (!scoreSettings.pitch) {
      scoreSettings.pitch = DEFAULT_PITCH;
    }

    scoreSettings.noteGroupTypeSelectionMap = Map(
      scoreSettings.noteGroupTypeSelectionMap
    );

    return scoreSettings;
  }, logger.warn);

const getPersistedScoreData = () =>
  tryOrNull<ScoreData | null>(() => {
    return getFromLocalStorage<ScoreData>(LocalStorageKey.SCORE_DATA);
  }, logger.warn);

const getSharedScoreSettings = (shareString: string) =>
  tryOrNull<ScoreSettings>(() => {
    return decodeScoreSettingsShareString(shareString);
  }, logger.warn);

export const getPersistedAppState = (
  shareString?: string
): PersistedAppState => {
  const persistedScoreSettings = getPersistedScoreSettings();
  const persistedScoreData = getPersistedScoreData();

  let sharedScoreSettings: ScoreSettings | null = null;
  let shareDecodeErrorOcurred = false;

  // If we have a share string decode it. If we can't decode, set a flag so we can return an error
  // message later
  if (shareString) {
    sharedScoreSettings = getSharedScoreSettings(shareString);

    if (!sharedScoreSettings) {
      shareDecodeErrorOcurred = true;
    }
  }

  // Handle having a valid share string
  if (sharedScoreSettings) {
    // If the share string matches persisted settings return settings and persisted score
    // This will prevent losing the current store if the page is reloaded with the same share URL
    if (
      persistedScoreData &&
      compareScoreSettings(sharedScoreSettings, persistedScoreSettings)
    ) {
      return {
        scoreSettings: sharedScoreSettings,
        scoreData: persistedScoreData,
      };
    }

    // Otherwise, return the share string settings and a fresh score based from it
    return {
      scoreSettings: sharedScoreSettings,
      scoreData: getFreshScoreData(sharedScoreSettings),
    };
  }

  // Handle having persisted score settings and score data with at least one measure
  if (
    persistedScoreSettings &&
    persistedScoreData &&
    persistedScoreData.measures.length > 0
  ) {
    const persistedAppState: PersistedAppState = {
      scoreSettings: persistedScoreSettings,
      scoreData: persistedScoreData,
    };

    // If we tried to parse a share string and failed, set an error message
    if (shareDecodeErrorOcurred) {
      persistedAppState.errorMessage =
        'This share link is not valid. Your previous settings have been applied.';
    }

    return persistedAppState;
  }

  // Could not derive an app state, return default settings and a fresh score
  const persistedAppState = getDefaultPersistedAppState();

  // Add an error message if we captured one
  if (shareDecodeErrorOcurred) {
    persistedAppState.errorMessage =
      'This share link is not valid. Default settings have been applied.';
  }

  return persistedAppState;
};

export const persistAppState = (persistedAppState: PersistedAppState) => {
  setToLocalStorage<ScoreSettings>(
    LocalStorageKey.SCORE_SETTINGS,
    persistedAppState.scoreSettings
  );
  setToLocalStorage<ScoreData>(
    LocalStorageKey.SCORE_DATA,
    persistedAppState.scoreData
  );
};
