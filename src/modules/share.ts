/**
 * Decoding share strings:
 *
 * Version 0:
 * 0 - Version
 * 2 - Measure Count (decimal, 1, 2, 4 or 8)
 * 2 - Time signature index (hexadecimal, 0 = 2/4, 1 = 3/4, 2 = 4/4)
 * 00 - Selected note index (hexadecimal, 00 = whole note, 01 = half note, etc.)
 * ...
 *
 * Example:
 * 042000102 - 4 measures of 4/4 time with whole notes, half notes, and quarter notes
 *
 * Version 1:
 * 1 - Version
 * 2 - Measure Count (decimal, 1, 2, 4, or 8)
 * 2 - Time signature index (hexadecimal, 0 = 2/4, 1 = 3/4, 2 = 4/4)
 * 080 - Tempo in BPM (decimal, 40-300)
 * 8 - Pitch class index (hexadecimal, 0 - A, 1 - Bb, 2 - B, ... B - Ab)
 * 3 - Octave index (decimal, 0-7)
 * 00 - Selected note index (hexadecimal, 00 = whole note, 01 = half note, etc.)
 *
 * Example:
 * 14212014000102 - 4 measures of 4/4 time with whole notes, half notes, and quarter notes, played
 * back at 120 BPM on the pitch Bb3.
 *
 * Version 2:
 * 2 - Version
 * 2 - Measure Count (decimal, 1, 2, 4, or 8)
 * 2 - Time signature index (hexadecimal, 0 = 2/4, 1 = 3/4, 2 = 4/4)
 * 080 - Tempo in BPM (decimal, 40-300)
 * 8 - Pitch class index (hexadecimal, 0 - A, 1 - Bb, 2 - B, ... B - Ab)
 * 3 - Octave index (decimal, 0-7)
 * 1 - Metronome count-off, future use (hexadecimal, 2 LSB to represent 0, 1 or 2 measure count-off)
 * 2 - Metronome settings, future use (hexadecimal, 4 bits: future, subdivision, measure, active)
 * 00 - Selected note index (hexadecimal, 00 = whole note, 01 = half note, etc.)
 *
 * Example:
 * 1421201413000102 - 4 measures of 4/4 time with whole notes, half notes, and quarter notes, played
 * back at 120 BPM on the pitch Bb3, with the metronome active, with a 1 measure count-off, measure
 * click on, and subdivision click off
 *
 */

import {
  DEFAULT_METRONOME_SETTINGS,
  DEFAULT_PITCH,
  DEFAULT_TEMPO,
  MeasureCount,
  MEASURE_COUNT_OPTIONS,
  ScoreSettings,
} from '../App';
import { MAX_TEMPO, MIN_TEMPO } from '../components/TempoControl';
import { MetronomeSettings } from './metronome';
import {
  getNoteGroup,
  getNoteGroupTypeSelectionMap,
  isValidNoteGroupForTimeSignature,
  resetNoteGroupTypeSelectionMap,
} from './note';
import {
  noteGroups,
  NoteGroupTypeSelectionMap,
  Octave,
  Pitch,
  PitchClass,
} from './note-definition';
import { TimeSignature, timeSignatures } from './time-signature';

const SHARE_DECODE_ERROR_MESSAGE = 'Cannot decode share string';
const MAX_OCTAVE_INDEX = 7;

export enum ShareStringEncodingVersion {
  _0 = '0',
  _1 = '1',
  _2 = '2',
}

const pitchClassIndexMap: { [key: string]: number } = {
  [PitchClass.A]: 0,
  [PitchClass.Bb]: 1,
  [PitchClass.B]: 2,
  [PitchClass.C]: 3,
  [PitchClass.Db]: 4,
  [PitchClass.D]: 5,
  [PitchClass.Eb]: 6,
  [PitchClass.E]: 7,
  [PitchClass.F]: 8,
  [PitchClass.Gb]: 9,
  [PitchClass.G]: 10,
  [PitchClass.Ab]: 11,
};

const parseNumberString = (radix: number) => (numberString: string) => {
  const number = parseInt(numberString, radix);

  if (isNaN(number)) {
    throw new Error(SHARE_DECODE_ERROR_MESSAGE);
  }

  return number;
};

const parseDecString = parseNumberString(10);
const parseHexString = parseNumberString(16);

const encodeMeasureCountAndTimeSignature = (
  measureCount: number,
  timeSignature: TimeSignature
): string => {
  return `${measureCount}${timeSignature.index.toString(16)}`;
};

const encodeNoteGroupTypeSelectionMap = (
  noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap,
  timeSignature: TimeSignature
) => {
  const selectedNoteGroupIndices: number[] = [];

  noteGroupTypeSelectionMap.forEach((checked, noteGroupType) => {
    const noteGroup = getNoteGroup(noteGroupType);
    if (isValidNoteGroupForTimeSignature(noteGroup, timeSignature) && checked) {
      selectedNoteGroupIndices.push(noteGroup.index);
    }
  });

  // Sort, so that we have a consistent string for the given note combinations
  selectedNoteGroupIndices.sort((a, b) => a - b);

  // For each selected note, a 2-character hex number of the note group index
  return selectedNoteGroupIndices.reduce((acc: string, index: number) => {
    return acc + index.toString(16).padStart(2, '0');
  }, '');
};

const encodeVersion0ShareString = (scoreSettings: ScoreSettings): string => {
  // First character - current version
  let shareString = ShareStringEncodingVersion._0.toString();

  // Second character - count of measures (1, 2, 4, 8)
  // Third character - time signature index (ex. 4/4 = 2)
  shareString += encodeMeasureCountAndTimeSignature(
    scoreSettings.measureCount,
    scoreSettings.timeSignature
  );

  // Remaining characters, encoded note group type selections
  shareString += encodeNoteGroupTypeSelectionMap(
    scoreSettings.noteGroupTypeSelectionMap,
    scoreSettings.timeSignature
  );

  return shareString;
};

const encodeVersion1ShareString = (scoreSettings: ScoreSettings): string => {
  // First character - current version
  let shareString = ShareStringEncodingVersion._1.toString();

  // Second character - count of measures (1, 2, 4, 8)
  // Third character - time signature index (ex. 4/4 = 2)
  shareString += encodeMeasureCountAndTimeSignature(
    scoreSettings.measureCount,
    scoreSettings.timeSignature
  );

  // 4th-6th characters - tempo in BPM
  shareString += scoreSettings.tempo.toString().padStart(3, '0');

  // 7th character - pitch class index (hex)
  shareString += pitchClassIndexMap[scoreSettings.pitch.pitchClass].toString(
    16
  );

  // 8th character - pitch octave index (dec)
  shareString += scoreSettings.pitch.octave.toString();

  // Remaining characters, encoded note group type selections
  shareString += encodeNoteGroupTypeSelectionMap(
    scoreSettings.noteGroupTypeSelectionMap,
    scoreSettings.timeSignature
  );

  return shareString;
};

const encodeVersion2ShareString = (scoreSettings: ScoreSettings): string => {
  // First character - current version
  let shareString = ShareStringEncodingVersion._2.toString();

  // Second character - count of measures (1, 2, 4, 8)
  // Third character - time signature index (ex. 4/4 = 2)
  shareString += encodeMeasureCountAndTimeSignature(
    scoreSettings.measureCount,
    scoreSettings.timeSignature
  );

  // 4th-6th characters - tempo in BPM
  shareString += scoreSettings.tempo.toString().padStart(3, '0');

  // 7th character - pitch class index (hex)
  shareString += pitchClassIndexMap[scoreSettings.pitch.pitchClass].toString(
    16
  );

  // 8th character - pitch octave index (dec)
  shareString += scoreSettings.pitch.octave.toString();

  // 9th character - metronome count-off value (hex)
  shareString += scoreSettings.metronomeSettings.countOffMeasures.toString(16);

  // 10th character - metronome boolean settings (hex)
  shareString += parseInt(
    0 +
      (+scoreSettings.metronomeSettings.subdivisionClick).toString() +
      (+scoreSettings.metronomeSettings.startOfMeasureClick).toString() +
      (+scoreSettings.metronomeSettings.active).toString(),
    2
  ).toString(16);

  // Remaining characters, encoded note group type selections
  shareString += encodeNoteGroupTypeSelectionMap(
    scoreSettings.noteGroupTypeSelectionMap,
    scoreSettings.timeSignature
  );

  return shareString;
};

export const encodeScoreSettingsShareString = (
  scoreSettings: ScoreSettings,
  version: ShareStringEncodingVersion
): string => {
  switch (version) {
    case ShareStringEncodingVersion._0:
      return encodeVersion0ShareString(scoreSettings);
    case ShareStringEncodingVersion._1:
      return encodeVersion1ShareString(scoreSettings);
    case ShareStringEncodingVersion._2:
      return encodeVersion2ShareString(scoreSettings);
  }
};

const decodeMeasureCount = (shareString: string): number => {
  const measureCount = parseDecString(shareString.charAt(1)) as MeasureCount;

  if (!MEASURE_COUNT_OPTIONS.includes(measureCount)) {
    throw new Error(SHARE_DECODE_ERROR_MESSAGE);
  }

  return measureCount;
};

const decodeTimeSignature = (shareString: string): TimeSignature => {
  const timeSignatureIndex = parseHexString(shareString.charAt(2));
  const timeSignature = timeSignatures.find(
    (ts) => ts.index === timeSignatureIndex
  );

  if (!timeSignature) {
    throw new Error(SHARE_DECODE_ERROR_MESSAGE);
  }

  return timeSignature;
};

const decodeNoteGroupTypeSelectionMap = (selectedNoteGroupIndices: string) => {
  // We should have an even number of characters
  if (selectedNoteGroupIndices.length % 2 > 0) {
    throw new Error(SHARE_DECODE_ERROR_MESSAGE);
  }

  // Parse the note index hex numbers into decimals
  const parsedSelectedNoteGroupIndices: number[] = [];
  for (let i = 0; i < selectedNoteGroupIndices.length; i += 2) {
    const noteGroupIndexHex = selectedNoteGroupIndices.substr(i, 2);
    parsedSelectedNoteGroupIndices.push(parseHexString(noteGroupIndexHex));
  }

  // Look up the note group types by index
  const selectedNoteGroupTypes = parsedSelectedNoteGroupIndices.map((index) => {
    const noteGroup = noteGroups.find((ng) => ng.index === index);

    if (!noteGroup) {
      throw new Error(SHARE_DECODE_ERROR_MESSAGE);
    }

    return noteGroup.type;
  });

  // Initiate a fresh "empty" note group type selection map
  let noteGroupTypeSelectionMap = resetNoteGroupTypeSelectionMap(
    getNoteGroupTypeSelectionMap()
  );

  // Set each note group type to checked
  selectedNoteGroupTypes.forEach((noteGroupType) => {
    noteGroupTypeSelectionMap = noteGroupTypeSelectionMap.set(
      noteGroupType,
      true
    );
  });

  return noteGroupTypeSelectionMap;
};

const decodeTempo = (shareString: string): number => {
  const tempo = parseDecString(shareString.substr(3, 3));

  // Check if tempo is in expected range
  if (tempo < MIN_TEMPO || tempo > MAX_TEMPO) {
    throw new Error(SHARE_DECODE_ERROR_MESSAGE);
  }

  return tempo;
};

const decodePitch = (shareString: string): Pitch => {
  const pitchClassIndex = parseHexString(shareString.charAt(6));

  const foundPitchClassIndexMapEntry = Object.entries(pitchClassIndexMap).find(
    ([, index]) => {
      return pitchClassIndex === index;
    }
  );

  if (!foundPitchClassIndexMapEntry) {
    throw new Error(SHARE_DECODE_ERROR_MESSAGE);
  }

  const pitchClass = foundPitchClassIndexMapEntry[0] as PitchClass;

  // Extract octave (8th character)
  const octaveIndex = parseDecString(shareString.charAt(7));

  if (octaveIndex > MAX_OCTAVE_INDEX) {
    throw new Error(SHARE_DECODE_ERROR_MESSAGE);
  }

  const octave = octaveIndex.toString() as Octave;

  return { pitchClass, octave };
};

const decodeMetronomeSettings = (shareString: string): MetronomeSettings => {
  const countOffMeasures = parseHexString(shareString.charAt(8));

  // Count of measures cannot be more than 2
  if (countOffMeasures > 2) {
    throw new Error(SHARE_DECODE_ERROR_MESSAGE);
  }

  // Extract 4 boolean values form the hexadecimal value at character 8
  const [_, subdivisionClick, startOfMeasureClick, active] = parseHexString(
    shareString.charAt(9)
  )
    .toString(2)
    .padStart(4, '0')
    .split('')
    .map((c) => Boolean(parseInt(c, 2)));

  return {
    active,
    startOfMeasureClick,
    subdivisionClick,
    countOffMeasures,
  };
};

const decodeVersion0ShareString = (shareString: string): ScoreSettings => {
  // Minimum valid string must contain a version, measure count, time signature, and one note group
  // (1 + 1 + 1 + 2 = 5)
  if (shareString.length < 5) {
    throw new Error(SHARE_DECODE_ERROR_MESSAGE);
  }

  // Extract the measure count (2nd character)
  const measureCount = decodeMeasureCount(shareString) as MeasureCount;

  // Extract time signature index and look up time signature (3rd character)
  const timeSignature = decodeTimeSignature(shareString);

  // Extract selected note groups (remaining characters)
  const selectedNoteGroupIndices = shareString.substr(3);
  const noteGroupTypeSelectionMap = decodeNoteGroupTypeSelectionMap(
    selectedNoteGroupIndices
  );

  return {
    measureCount,
    timeSignature,
    noteGroupTypeSelectionMap,
    tempo: DEFAULT_TEMPO,
    pitch: DEFAULT_PITCH,
    metronomeSettings: DEFAULT_METRONOME_SETTINGS,
  };
};

const decodeVersion1ShareString = (shareString: string): ScoreSettings => {
  // Minimum valid string must contain a version, measure count, time signature, tempo, pitch class,
  // octave, and one note group
  // (1 + 1 + 1 + 3 + 1 + 1 + 2 = 10)
  if (shareString.length < 10) {
    throw new Error(SHARE_DECODE_ERROR_MESSAGE);
  }

  // Extract the measure count (2nd character)
  const measureCount = decodeMeasureCount(shareString) as MeasureCount;

  // Extract time signature index and look up time signature (3rd character)
  const timeSignature = decodeTimeSignature(shareString);

  // Extract tempo (4th-6th characters)
  const tempo = decodeTempo(shareString);

  // Extract pitch class and octave (7th and 8th characters)
  const pitch = decodePitch(shareString);

  // Extract selected note groups (remaining characters)
  const selectedNoteGroupIndices = shareString.substr(8);
  const noteGroupTypeSelectionMap = decodeNoteGroupTypeSelectionMap(
    selectedNoteGroupIndices
  );

  return {
    measureCount,
    timeSignature,
    noteGroupTypeSelectionMap,
    tempo,
    pitch,
    metronomeSettings: DEFAULT_METRONOME_SETTINGS,
  };
};

const decodeVersion2ShareString = (shareString: string): ScoreSettings => {
  // Minimum valid string must contain a version, measure count, time signature, tempo, pitch class,
  // octave, 2 hex digits for metronome settings, and one note group
  // (1 + 1 + 1 + 3 + 1 + 1 + 2 + 2 = 12)
  if (shareString.length < 12) {
    throw new Error(SHARE_DECODE_ERROR_MESSAGE);
  }

  // Extract the measure count (2nd character)
  const measureCount = decodeMeasureCount(shareString) as MeasureCount;

  // Extract time signature index and look up time signature (3rd character)
  const timeSignature = decodeTimeSignature(shareString);

  // Extract tempo (4th-6th characters)
  const tempo = decodeTempo(shareString);

  // Extract pitch class and octave (7th and 8th characters)
  const pitch = decodePitch(shareString);

  // Extract metronome count off value and settings (9th and 10th characters)
  const metronomeSettings = decodeMetronomeSettings(shareString);

  // Extract selected note groups (remaining characters)
  const selectedNoteGroupIndices = shareString.substr(10);
  const noteGroupTypeSelectionMap = decodeNoteGroupTypeSelectionMap(
    selectedNoteGroupIndices
  );

  return {
    measureCount,
    timeSignature,
    noteGroupTypeSelectionMap,
    tempo,
    pitch,
    metronomeSettings,
  };
};

export const decodeScoreSettingsShareString = (
  shareString: string
): ScoreSettings => {
  const version = shareString.charAt(0);
  switch (version) {
    case '0':
      return decodeVersion0ShareString(shareString);
    case '1':
      return decodeVersion1ShareString(shareString);
    case '2':
      return decodeVersion2ShareString(shareString);
    default:
      throw new Error(SHARE_DECODE_ERROR_MESSAGE);
  }
};
