import {
  NoteGroupType,
  NoteGroup,
  getTotalDuration,
  getNoteGroups,
  getNoteGroup,
  NoteGroupTypeSelectionMap,
  getSelectedNoteGroupTypes,
  GeneratedNoteGroup,
} from './note';
import { Measure } from './vex';
import { InvalidNoteSelectionError } from './error';
import { TimeSignature } from './time-signature';
import { sortBy } from 'lodash';
import { duplicate } from './util';

const logger = console;

const MAX_LOOP_COUNT = 1000;

const getRandomNoteDefinition = (
  possibleNoteGroupTypes: NoteGroupType[]
): NoteGroup => {
  const randomIndex = Math.floor(Math.random() * possibleNoteGroupTypes.length);
  const randomNoteGroupType = possibleNoteGroupTypes[randomIndex];
  return getNoteGroup(randomNoteGroupType);
};

const getRandomMeasure = (
  noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap,
  timeSignature: TimeSignature
): Measure => {
  const selectedNoteGroupTypes = getSelectedNoteGroupTypes(
    noteGroupTypeSelectionMap,
    timeSignature
  );

  if (selectedNoteGroupTypes.length === 0) {
    throw new InvalidNoteSelectionError();
  }

  const possibleNoteGroups = getNoteGroups(...selectedNoteGroupTypes);
  const uniqueDurations = [
    ...new Set(possibleNoteGroups.map((ng) => ng.duration)),
  ];

  const durationPerMeasure = timeSignature.beatsPerMeasure;

  // If any duration is larger than the measure, not valid
  if (uniqueDurations.some((d) => d > durationPerMeasure)) {
    throw new InvalidNoteSelectionError();
  }

  let randomMeasure: Measure = {
    noteGroups: [],
  };

  let totalDuration: number = 0;

  let loopCount = 0;

  while (totalDuration < durationPerMeasure) {
    const nextPossibleNoteGroup = getRandomNoteDefinition(
      selectedNoteGroupTypes
    );

    if (nextPossibleNoteGroup.duration + totalDuration > durationPerMeasure) {
      // Detect infinite loops, incase there's a possible edge case the other logic in this
      // function cannot handle
      if (loopCount > MAX_LOOP_COUNT) {
        logger.warn('Infinite loop detected!');
        throw new InvalidNoteSelectionError();
      }

      loopCount++;
      continue;
    }

    const generatedNoteGroup: GeneratedNoteGroup = {
      type: nextPossibleNoteGroup.type,
      notes: nextPossibleNoteGroup.notes,
      duration: nextPossibleNoteGroup.duration,
    };

    if (nextPossibleNoteGroup.beam) {
      generatedNoteGroup.beam = true;
    }

    if (nextPossibleNoteGroup.tuplet) {
      generatedNoteGroup.tuplet = true;
    }

    randomMeasure.noteGroups.push(generatedNoteGroup);
    totalDuration = getTotalDuration(randomMeasure.noteGroups);

    const remainingDurationToFill = durationPerMeasure - totalDuration;

    if (
      remainingDurationToFill !== 0 &&
      !uniqueDurations.some((d) => d <= remainingDurationToFill)
    ) {
      throw new InvalidNoteSelectionError();
    }

    loopCount = 0;
  }

  return randomMeasure;
};

export const getRandomMeasures = (
  noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap,
  timeSignature: TimeSignature,
  measureCount: number,
  testMode = false
): Measure[] => {
  if (testMode) {
    return getTestRandomMeasures(
      noteGroupTypeSelectionMap,
      timeSignature,
      measureCount
    );
  }

  let measures: Measure[] = [];

  for (let i = 0; i < measureCount; i++) {
    measures.push(getRandomMeasure(noteGroupTypeSelectionMap, timeSignature));
  }

  return measures;
};

let testRandomMeasureIndex = 0;

export const getTestRandomMeasures = (
  noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap,
  timeSignature: TimeSignature,
  measureCount: number
): Measure[] => {
  const selectedNoteGroups = sortBy(
    getNoteGroups(
      ...getSelectedNoteGroupTypes(noteGroupTypeSelectionMap, timeSignature)
    ),
    (noteGroup) => noteGroup.index
  );

  const measures: Measure[] = [];

  for (let index = 0; index < measureCount; index++) {
    const noteGroup =
      selectedNoteGroups[
        (index + testRandomMeasureIndex) % selectedNoteGroups.length
      ];
    const timesToDuplicate = timeSignature.beatsPerMeasure / noteGroup.duration;

    if (!Number.isInteger(timesToDuplicate)) {
      throw new InvalidNoteSelectionError();
    }

    const measureOfNoteGroups = duplicate(noteGroup, timesToDuplicate);

    measures.push({ noteGroups: measureOfNoteGroups });
  }

  testRandomMeasureIndex++;

  return measures;
};

export const resetTestRandomMeasureIndex = () => {
  testRandomMeasureIndex = 0;
};
