import { Map } from 'immutable';
import {
  DEFAULT_METRONOME_SETTINGS,
  DEFAULT_PITCH,
  DEFAULT_TEMPO,
  MeasureCount,
  ScoreSettings,
} from '../App';
import {
  getNoteGroup,
  getNoteGroupTypeSelectionMap,
  isValidNoteGroupForTimeSignature,
  NoteGroupTypeSelectionMap,
  Pitch,
} from './note';
import { getRandomMeasures } from './random';
import { ScoreData } from './score';
import { decodeScoreSettingsShareString } from './share';
import { getTimeSignature, TimeSignatureType } from './time-signature';
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

  if (scoreSettingsA.timeSignature.type !== scoreSettingsB.timeSignature.type) {
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
    scoreSettingsA.metronomeSettings.countOffMeasures !==
    scoreSettingsB.metronomeSettings.countOffMeasures
  ) {
    return false;
  }

  if (
    scoreSettingsA.metronomeSettings.active !==
    scoreSettingsB.metronomeSettings.active
  ) {
    return false;
  }

  if (
    scoreSettingsA.metronomeSettings.startOfMeasureClick !==
    scoreSettingsB.metronomeSettings.startOfMeasureClick
  ) {
    return false;
  }

  if (
    scoreSettingsA.metronomeSettings.subdivisionClick !==
    scoreSettingsB.metronomeSettings.subdivisionClick
  ) {
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

const getFreshScoreData = (
  scoreSettings: ScoreSettings,
  testMode?: boolean
): ScoreData => {
  return {
    timeSignature: scoreSettings.timeSignature,
    measures: getRandomMeasures(
      scoreSettings.noteGroupTypeSelectionMap,
      scoreSettings.timeSignature,
      scoreSettings.measureCount,
      testMode
    ),
  };
};

const getDefaultPersistedAppState = (testMode?: boolean): PersistedAppState => {
  const measureCount: MeasureCount = 2;
  const timeSignature = getTimeSignature(TimeSignatureType.SIMPLE_4_4);
  const noteGroupTypeSelectionMap = getNoteGroupTypeSelectionMap();
  const tempo = DEFAULT_TEMPO;
  const pitch: Pitch = DEFAULT_PITCH;
  const metronomeSettings = DEFAULT_METRONOME_SETTINGS;

  const scoreSettings = {
    measureCount,
    timeSignature,
    noteGroupTypeSelectionMap,
    tempo,
    pitch,
    metronomeSettings,
  };

  return {
    scoreSettings,
    scoreData: getFreshScoreData(scoreSettings, testMode),
  };
};

const getPersistedScoreSettings = () =>
  tryOrNull<ScoreSettings | null>(() => {
    const scoreSettings = getFromLocalStorage<any>(
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

    if (!scoreSettings.metronomeSettings) {
      scoreSettings.metronomeSettings = DEFAULT_METRONOME_SETTINGS;
    }

    // Handle ensuring new note group selections are added an old persisted map
    const persistedNoteGroupTypeSelectionMap: NoteGroupTypeSelectionMap = Map(
      scoreSettings.noteGroupTypeSelectionMap
    );
    let newNoteGroupTypeSelectionMap = getNoteGroupTypeSelectionMap();

    persistedNoteGroupTypeSelectionMap.forEach((checked, noteGroupType) => {
      newNoteGroupTypeSelectionMap = newNoteGroupTypeSelectionMap.set(
        noteGroupType,
        checked
      );
    });

    scoreSettings.noteGroupTypeSelectionMap = newNoteGroupTypeSelectionMap;

    // Convert legacy persisted score settings objects
    if (scoreSettings.timeSignatureType) {
      scoreSettings.timeSignature = getTimeSignature(
        scoreSettings.timeSignatureType
      );
      delete scoreSettings.timeSignatureType;
    }

    return scoreSettings as ScoreSettings;
  }, logger.warn);

const getPersistedScoreData = () =>
  tryOrNull<ScoreData | null>(() => {
    const scoreData = getFromLocalStorage<ScoreData>(
      LocalStorageKey.SCORE_DATA
    );

    // Check for pre-playback score data. Trying to play this post-playback release will cause
    // playback to freeze. This checks if any of the notes are missing the `playbackUnit` property,
    // and returns `null`, which will generate a fresh score downstream.
    if (
      scoreData?.measures.some((measure) =>
        measure.noteGroups.some((noteGroup) =>
          noteGroup.notes.some((note) => !note.playbackUnit)
        )
      )
    ) {
      return null;
    }
    return scoreData;
  }, logger.warn);

const getSharedScoreSettings = (shareString: string) =>
  tryOrNull<ScoreSettings>(() => {
    return decodeScoreSettingsShareString(shareString);
  }, logger.warn);

export const getPersistedAppState = (
  shareString?: string,
  testMode?: boolean
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
    // Ensure that unselected notes from invalid time signatures do not inadvertently affect
    // persisted score data (i.e. we do not want to toggle off all of the user's persisted
    // compound meter settings because the share string was for simple meter)

    let resolvedNoteGroupTypeSelectionMap: NoteGroupTypeSelectionMap;
    if (persistedScoreSettings) {
      resolvedNoteGroupTypeSelectionMap =
        persistedScoreSettings.noteGroupTypeSelectionMap;
    } else {
      resolvedNoteGroupTypeSelectionMap = getNoteGroupTypeSelectionMap();
    }

    sharedScoreSettings.noteGroupTypeSelectionMap.forEach(
      (checked, noteGroupType) => {
        if (
          sharedScoreSettings &&
          isValidNoteGroupForTimeSignature(
            getNoteGroup(noteGroupType),
            sharedScoreSettings.timeSignature
          )
        ) {
          resolvedNoteGroupTypeSelectionMap = resolvedNoteGroupTypeSelectionMap.set(
            noteGroupType,
            checked
          );
        }
      }
    );

    sharedScoreSettings.noteGroupTypeSelectionMap = resolvedNoteGroupTypeSelectionMap;

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
      scoreData: getFreshScoreData(sharedScoreSettings, testMode),
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
  const persistedAppState = getDefaultPersistedAppState(testMode);

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
