import {
  NoteGroupType,
  NoteGroup,
  getTotalDuration,
  getNoteGroups,
  getNoteGroup,
  NoteGroupTypeSelectionMap,
  getSelectedNoteGroupTypes,
} from './note';
import { Measure } from './vex';
import { InvalidNoteSelectionError } from './error';
import { TimeSignature } from './time-signature';

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

    randomMeasure.noteGroups.push(nextPossibleNoteGroup);
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
  measureCount: number
): Measure[] => {
  let measures: Measure[] = [];

  for (let i = 0; i < measureCount; i++) {
    measures.push(getRandomMeasure(noteGroupTypeSelectionMap, timeSignature));
  }

  return measures;
};
