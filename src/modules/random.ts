import {
  NoteGroupType,
  NoteGroup,
  getTotalDuration,
  getNoteGroups,
  getNoteGroup,
} from './note';
import { Measure } from './vex';

const MAX_LOOP_COUNT = 100;

const getRandomNoteDefinition = (
  possibleNoteGroupTypes: NoteGroupType[]
): NoteGroup => {
  const randomIndex = Math.floor(Math.random() * possibleNoteGroupTypes.length);
  const randomNoteGroupType = possibleNoteGroupTypes[randomIndex];
  return getNoteGroup(randomNoteGroupType);
};

// TODO: Fix this by doing the "is the duration per measure divisible by at least one duration in a
// set of possible durations" test
const validateNoteSelection = (
  possibleNoteGroupTypes: NoteGroupType[],
  durationPerMeasure: number
): boolean => {
  // If no notes selected, not valid
  if (possibleNoteGroupTypes.length === 0) {
    return false;
  }

  const possibleNoteGroups = getNoteGroups(...possibleNoteGroupTypes);

  // If one note selected, and it is equal to the measure duration, valid
  if (
    possibleNoteGroups.length === 1 &&
    possibleNoteGroups[0].duration === durationPerMeasure
  ) {
    return true;
  }

  // If all of the notes selected are more than half of the measure duration, then
  // it will be impossible to fill a complete measure
  if (
    possibleNoteGroups.every(
      (noteGroup) => noteGroup.duration > durationPerMeasure / 2
    )
  ) {
    return false;
  }

  return true;
};

const getRandomMeasure = (
  possibleNoteGroupTypes: NoteGroupType[],
  durationPerMeasure: number
): Measure => {
  if (!validateNoteSelection(possibleNoteGroupTypes, durationPerMeasure)) {
    throw new Error('This combination of notes is not valid');
  }

  let randomMeasure: Measure = {
    noteGroups: [],
  };

  let totalDuration: number = 0;

  let loopCount = 0;

  while (totalDuration < durationPerMeasure) {
    const nextPossibleNoteGroup = getRandomNoteDefinition(
      possibleNoteGroupTypes
    );

    if (nextPossibleNoteGroup.duration + totalDuration > durationPerMeasure) {
      if (loopCount > MAX_LOOP_COUNT) {
        throw new Error('Loop detected while building random measure');
      }

      loopCount++;
      continue;
    }

    randomMeasure.noteGroups.push(nextPossibleNoteGroup);
    totalDuration = getTotalDuration(randomMeasure.noteGroups);
    loopCount = 0;
  }

  return randomMeasure;
};

export const getRandomMeasures = (
  possibleNoteGroupTypes: NoteGroupType[],
  durationPerMeasure: number,
  measureCount: number
): Measure[] => {
  let measures: Measure[] = [];

  for (let i = 0; i < measureCount; i++) {
    measures.push(getRandomMeasure(possibleNoteGroupTypes, durationPerMeasure));
  }

  return measures;
};
