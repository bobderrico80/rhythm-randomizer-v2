import {
  getNoteGroups,
  getSelectedNoteGroupTypes,
  generateNoteGroup,
  generateNoteGroups,
} from './note';
import {
  NoteGroup,
  NoteGroupTypeSelectionMap,
  NoteSubGroup,
  DynamicNoteGroup,
  Note,
} from './note-definition';
import { Measure } from './vex';
import { InvalidNoteSelectionError } from './error';
import { TimeSignature, TimeSignatureComplexity } from './time-signature';
import { isFunction, sortBy } from 'lodash';
import { duplicate } from './util';

const logger = console;

const MAX_LOOP_COUNT = 1000;

export interface Randomizable {
  duration: number | ((targetDuration: number) => number);
}

export const getDuration = <T extends Randomizable>(
  item: T,
  targetDuration: number
) => {
  return isFunction(item.duration)
    ? item.duration(targetDuration)
    : item.duration;
};

export const getRandomItems = <T extends Randomizable>(
  possibleItems: T[],
  targetDuration: number,
  includePredicate?: (itemsSoFar: T[]) => boolean
): T[] => {
  const uniqueDurations = [
    ...new Set(possibleItems.map((item) => item.duration)),
  ];

  // If any duration is larger than the target duration, throw an error
  if (uniqueDurations.some((d) => d > targetDuration)) {
    throw new Error();
  }

  const randomItems: T[] = [];

  let totalDuration = 0;
  let loopCount = 0;

  while (totalDuration < targetDuration) {
    const randomIndex = Math.floor(Math.random() * possibleItems.length);
    const nextPossibleItem = possibleItems[randomIndex];

    // Detect infinite loops, incase it becomes impossible to reach the target with the possible
    // items
    if (loopCount > MAX_LOOP_COUNT) {
      logger.warn('Infinite loop detected!');
      throw new Error();
    }

    if (
      getDuration(nextPossibleItem, targetDuration) + totalDuration >
      targetDuration
    ) {
      loopCount++;
      continue;
    }

    if (
      includePredicate &&
      !includePredicate([...randomItems, nextPossibleItem])
    ) {
      loopCount++;
      if (loopCount === 999) {
        logger.warn('Infinite loop caused by include predicate', [
          ...randomItems,
          nextPossibleItem,
        ]);
      }
      continue;
    }

    randomItems.push(nextPossibleItem);
    totalDuration = randomItems.reduce(
      (total, item) => total + getDuration(item, targetDuration),
      0
    );

    const remainingDurationToFill = targetDuration - totalDuration;

    if (
      remainingDurationToFill !== 0 &&
      !uniqueDurations.some((d) => d <= remainingDurationToFill)
    ) {
      throw new Error();
    }

    loopCount = 0;
  }

  return randomItems;
};

const getRandomMeasure = (
  noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap,
  timeSignature: TimeSignature
): Measure => {
  // TODO: Handle asymmetrical meter
  if (timeSignature.complexity === TimeSignatureComplexity.ASYMMETRICAL) {
    return { noteGroups: [] };
  }

  const selectedNoteGroupTypes = getSelectedNoteGroupTypes(
    noteGroupTypeSelectionMap,
    timeSignature
  );

  if (selectedNoteGroupTypes.length === 0) {
    throw new InvalidNoteSelectionError();
  }

  const possibleNoteGroups = getNoteGroups(...selectedNoteGroupTypes);

  let randomNoteGroups: NoteGroup[];
  try {
    randomNoteGroups = getRandomItems(
      possibleNoteGroups,
      timeSignature.beatsPerMeasure
    );
  } catch (error) {
    throw new InvalidNoteSelectionError();
  }

  let randomMeasure: Measure = {
    noteGroups: generateNoteGroups(randomNoteGroups, timeSignature),
  };

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
  // TODO: Handle asymmetrical meter
  if (timeSignature.complexity === TimeSignatureComplexity.ASYMMETRICAL) {
    return [];
  }

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
    const timesToDuplicate =
      timeSignature.beatsPerMeasure /
      getDuration(noteGroup, timeSignature.beatsPerMeasure);

    const generatedNoteGroup = generateNoteGroup(
      noteGroup,
      timeSignature,
      true
    );

    if (!Number.isInteger(timesToDuplicate)) {
      throw new InvalidNoteSelectionError();
    }

    const measureOfNoteGroups = duplicate(generatedNoteGroup, timesToDuplicate);

    measures.push({ noteGroups: measureOfNoteGroups });
  }

  testRandomMeasureIndex++;

  return measures;
};

export const randomizeNoteSubGroups = (
  dynamicNoteGroup: DynamicNoteGroup,
  testMode: boolean = false
): Note[] => {
  let randomizedSubGroups: NoteSubGroup[];

  if (testMode) {
    // In test mode, just use the first subgroup
    randomizedSubGroups = getRandomItems(
      [dynamicNoteGroup.noteTemplate[0]],
      dynamicNoteGroup.subGroupTargetDuration,
      dynamicNoteGroup.includePredicate
    );
  } else {
    randomizedSubGroups = getRandomItems(
      dynamicNoteGroup.noteTemplate,
      dynamicNoteGroup.subGroupTargetDuration,
      dynamicNoteGroup.includePredicate
    );
  }

  return randomizedSubGroups.reduce((previousNotes, subGroup) => {
    return [...previousNotes, ...subGroup.notes];
  }, [] as Note[]);
};

export const resetTestRandomMeasureIndex = () => {
  testRandomMeasureIndex = 0;
};
