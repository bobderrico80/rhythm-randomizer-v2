/**
 * Decoding share strings:
 *
 * Version 0:
 * 0 - Version
 * 2 - Measure Count (decimal, 1, 2, 4 or 8)
 * 2 - Time signature index (decimal, 0 = 2/4, 1 = 3/4, 2 = 4/4)
 * 00 - Selected note index (hexadecimal, 00 = whole note, 01 = half note, etc.)
 * ...
 *
 * Example:
 * 042000102 - 4 measures of 4/4 time with whole notes, half notes, and quarter notes
 *
 * Version 1:
 * 1 - Version
 * 2 - Measure Count (decimal, 1, 2, 4, or 8)
 * 2 - Time signature index (decimal, 0 = 2/4, 1 = 3/4, 2 = 4/4)
 * 080 - Tempo in BPM (decimal, 40-300)
 * 8 - Pitch class index (hexadecimal, 0 - A, 1 - Bb, 2 - B, ... B - Ab)
 * 3 - Octave index (decimal, 0-7)
 * 00 - Selected note index (hexadecimal, 00 = whole note, 01 = half note, etc.)
 *
 * Example:
 * 14212014000102 - 4 measures of 4/4 time with whole notes, half notes, and quarter notes, played
 * back at 120 BPM on the pitch Bb3.
 *
 */

import {
  DEFAULT_PITCH,
  DEFAULT_TEMPO,
  MEASURE_COUNT_OPTIONS,
  ScoreSettings,
} from '../App';
import { MAX_TEMPO, MIN_TEMPO } from '../components/TempoControl';
import {
  getNoteGroup,
  getNoteGroupTypeSelectionMap,
  noteGroups,
  NoteGroupTypeSelectionMap,
  resetNoteGroupTypeSelectionMap,
} from './note';
import {
  getTimeSignature,
  TimeSignature,
  timeSignatures,
  TimeSignatureType,
} from './time-signature';
import { Octave, Pitch, PitchClass } from './tone';

const SHARE_DECODE_ERROR_MESSAGE = 'Cannot decode share string';
const MAX_OCTAVE_INDEX = 7;

export enum ShareStringEncodingVersion {
  _0 = '0',
  _1 = '1',
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
  timeSignatureType: TimeSignatureType
): string => {
  return `${measureCount}${getTimeSignature(timeSignatureType).index}`;
};

const encodeNoteGroupTypeSelectionMap = (
  noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap
) => {
  const selectedNoteGroupIndices: number[] = [];

  noteGroupTypeSelectionMap.forEach((checked, noteGroupType) => {
    if (checked) {
      selectedNoteGroupIndices.push(getNoteGroup(noteGroupType).index);
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
    scoreSettings.timeSignatureType
  );

  // Remaining characters, encoded note group type selections
  shareString += encodeNoteGroupTypeSelectionMap(
    scoreSettings.noteGroupTypeSelectionMap
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
    scoreSettings.timeSignatureType
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
    scoreSettings.noteGroupTypeSelectionMap
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
  }
};

const decodeMeasureCount = (shareString: string): number => {
  const measureCount = parseDecString(shareString.charAt(1));

  if (!MEASURE_COUNT_OPTIONS.includes(measureCount)) {
    throw new Error(SHARE_DECODE_ERROR_MESSAGE);
  }

  return measureCount;
};

const decodeTimeSignature = (shareString: string): TimeSignature => {
  const timeSignatureIndex = parseDecString(shareString.charAt(2));
  const timeSignature = timeSignatures.find(
    (ts) => ts.index === timeSignatureIndex
  );

  if (!timeSignature) {
    throw new Error(SHARE_DECODE_ERROR_MESSAGE);
  }

  return timeSignature;
};

const decodeNoteGroupTypeSelectionMap = (
  selectedNoteGroupIndices: string,
  timeSignature: TimeSignature
) => {
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
    getNoteGroupTypeSelectionMap(timeSignature.beatsPerMeasure)
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

const decodeVersion0ShareString = (shareString: string): ScoreSettings => {
  // Minimum valid string must contain a version, measure count, time signature, and one note group
  // (1 + 1 + 1 + 2 = 5)
  if (shareString.length < 5) {
    throw new Error(SHARE_DECODE_ERROR_MESSAGE);
  }

  // Extract the measure count (2nd character)
  const measureCount = decodeMeasureCount(shareString);

  // Extract time signature index and look up time signature (3rd character)
  const timeSignature = decodeTimeSignature(shareString);

  // Extract selected note groups (remaining characters)
  const selectedNoteGroupIndices = shareString.substr(3);
  const noteGroupTypeSelectionMap = decodeNoteGroupTypeSelectionMap(
    selectedNoteGroupIndices,
    timeSignature
  );

  return {
    measureCount,
    timeSignatureType: timeSignature.type,
    noteGroupTypeSelectionMap,
    tempo: DEFAULT_TEMPO,
    pitch: DEFAULT_PITCH,
  };
};

const decodeVersion1ShareString = (shareString: string) => {
  // Minimum valid string must contain a version, measure count, time signature, tempo, pitch class,
  // octave, and one note group
  // (1 + 1 + 1 + 3 + 1 + 1 + 2 = 10)
  if (shareString.length < 10) {
    throw new Error(SHARE_DECODE_ERROR_MESSAGE);
  }

  // Extract the measure count (2nd character)
  const measureCount = decodeMeasureCount(shareString);

  // Extract time signature index and look up time signature (3rd character)
  const timeSignature = decodeTimeSignature(shareString);

  // Extract tempo (4th-6th characters)
  const tempo = decodeTempo(shareString);

  // Extract pitch class and octave (7th and 8th characters)
  const pitch = decodePitch(shareString);

  // Extract selected note groups (remaining characters)
  const selectedNoteGroupIndices = shareString.substr(8);
  const noteGroupTypeSelectionMap = decodeNoteGroupTypeSelectionMap(
    selectedNoteGroupIndices,
    timeSignature
  );

  return {
    measureCount,
    timeSignatureType: timeSignature.type,
    noteGroupTypeSelectionMap,
    tempo,
    pitch,
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
    default:
      throw new Error(SHARE_DECODE_ERROR_MESSAGE);
  }
};
