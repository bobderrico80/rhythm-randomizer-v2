import {
  NoteGroupType,
  NoteGroup,
  getTotalDuration,
  getNoteGroups,
  getNoteGroup,
  NoteGroupTypeSelectionMap,
} from './note';
import { Measure } from './vex';
import { InvalidNoteSelectionError } from './error';

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
  durationPerMeasure: number
): Measure => {
  const possibleNoteGroupTypes = [
    ...noteGroupTypeSelectionMap.entries(),
  ].reduce((previousNoteGroupTypes, [noteGroupType, checked]) => {
    if (checked) {
      previousNoteGroupTypes.push(noteGroupType);
    }

    return previousNoteGroupTypes;
  }, [] as NoteGroupType[]);

  if (possibleNoteGroupTypes.length === 0) {
    throw new InvalidNoteSelectionError();
  }

  const possibleNoteGroups = getNoteGroups(...possibleNoteGroupTypes);
  const uniqueDurations = [
    ...new Set(possibleNoteGroups.map((ng) => ng.duration)),
  ];

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
      possibleNoteGroupTypes
    );

    if (nextPossibleNoteGroup.duration + totalDuration > durationPerMeasure) {
      // Detect infinite loops, incase there's a possible edge case the other logic in this
      // function cannot handle
      if (loopCount > MAX_LOOP_COUNT) {
        console.warn('Infinite loop detected!');
        throw new InvalidNoteSelectionError();
      }

      loopCount++;
      continue;
    }

    randomMeasure.noteGroups.push(nextPossibleNoteGroup);
    totalDuration = getTotalDuration(randomMeasure.noteGroups);

    const remainingDurationToFill = durationPerMeasure - totalDuration;

    // If there isn't at least one possible note that fits within the remaining duration, we can't
    // complete the rhythm
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
  durationPerMeasure: number,
  measureCount: number
): Measure[] => {
  let measures: Measure[] = [];

  for (let i = 0; i < measureCount; i++) {
    measures.push(
      getRandomMeasure(noteGroupTypeSelectionMap, durationPerMeasure)
    );
  }

  return measures;
};
