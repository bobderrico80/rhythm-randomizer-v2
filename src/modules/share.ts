/**
 * Decoding share strings:
 *
 * 0 - Version (must be zero)
 * 2 - Measure Count (decimal, 1, 2, 4 or 8)
 * 2 - Time signature index (decimal, 0 = 2/4, 1 = 3/4, 2 = 4/4)
 * 00 - Selected note index (hexadecimal, 00 = whole note, 01 = half note, etc.)
 * ...
 *
 * Example:
 * 042000102 - 4 measures of 4/4 time with whole notes, half notes, and quarter notes
 */

import { MEASURE_COUNT_OPTIONS, ScoreSettings } from '../App';
import {
  getNoteGroup,
  getNoteGroupTypeSelectionMap,
  noteGroups,
  resetNoteGroupTypeSelectionMap,
} from './note';
import { getTimeSignature, timeSignatures } from './time-signature';

const SHARE_ENCODING_VERSION = '0';
const SHARE_DECODE_ERROR_MESSAGE = 'Cannot decode share string';

const parseNumberString = (radix: number) => (numberString: string) => {
  const number = parseInt(numberString, radix);

  if (isNaN(number)) {
    throw new Error(SHARE_DECODE_ERROR_MESSAGE);
  }

  return number;
};

const parseDecString = parseNumberString(10);
const parseHexString = parseNumberString(16);

export const encodeScoreSettingsShareString = (
  scoreSettings: ScoreSettings
): string => {
  // First character - current version
  let shareString = SHARE_ENCODING_VERSION;

  // Second character - count of measures (1, 2, 4, 8)
  shareString += scoreSettings.measureCount;

  // Third character - time signature index (ex. 4/4 = 2)
  shareString += getTimeSignature(scoreSettings.timeSignatureType).index;

  const selectedNoteGroupIndices: number[] = [];

  scoreSettings.noteGroupTypeSelectionMap.forEach((checked, noteGroupType) => {
    if (checked) {
      selectedNoteGroupIndices.push(getNoteGroup(noteGroupType).index);
    }
  });

  // Sort, so that we have a consistent string for the give note combinations
  selectedNoteGroupIndices.sort((a, b) => a - b);

  // For each selected note, a 2-character hex number of the note group index
  shareString += selectedNoteGroupIndices.reduce(
    (acc: string, index: number) => {
      return acc + index.toString(16).padStart(2, '0');
    },
    ''
  );

  return shareString;
};

export const decodeScoreSettingsShareString = (
  shareString: string
): ScoreSettings => {
  // Minimum valid string must contain a version, measure count, time signature, and one note group
  // (1 + 1 + 1 + 2 = 5)
  if (shareString.length < 5) {
    throw new Error(SHARE_DECODE_ERROR_MESSAGE);
  }

  // This function currently only supports version '0' share strings
  if (shareString.charAt(0) !== '0') {
    throw new Error(SHARE_DECODE_ERROR_MESSAGE);
  }

  // Extract the measure count (2nd character)
  const measureCount: number = parseDecString(shareString.charAt(1));

  if (!MEASURE_COUNT_OPTIONS.includes(measureCount)) {
    throw new Error(SHARE_DECODE_ERROR_MESSAGE);
  }

  // Extract time signature index and look up time signature (3rd character)
  const timeSignatureIndex = parseDecString(shareString.charAt(2));
  const timeSignature = timeSignatures.find(
    (ts) => ts.index === timeSignatureIndex
  );

  if (!timeSignature) {
    throw new Error(SHARE_DECODE_ERROR_MESSAGE);
  }

  // Extract selected note groups (remaining characters)
  let selectedNoteGroupIndices = shareString.substr(3);

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

  return {
    measureCount,
    timeSignatureType: timeSignature.type,
    noteGroupTypeSelectionMap,
  };
};
