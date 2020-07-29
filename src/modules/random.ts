import {
  NoteType,
  NoteDefinition,
  getNoteDefinition,
  getTotalDuration,
  getNoteDefinitions,
} from './note';

const MAX_LOOP_COUNT = 100;

const getRandomNoteDefinition = (
  possibleNoteTypes: NoteType[]
): NoteDefinition => {
  const randomIndex = Math.floor(Math.random() * possibleNoteTypes.length);
  const randomNoteType = possibleNoteTypes[randomIndex];
  return getNoteDefinition(randomNoteType);
};

const validateNoteSelection = (
  possibleNoteTypes: NoteType[],
  durationPerMeasure: number
): boolean => {
  // If no notes selected, not valid
  if (possibleNoteTypes.length === 0) {
    return false;
  }

  const possibleNoteDefinitions = getNoteDefinitions(...possibleNoteTypes);

  // If one note selected, and it is equal to the measure duration, valid
  if (
    possibleNoteDefinitions.length === 1 &&
    possibleNoteDefinitions[0].duration === durationPerMeasure
  ) {
    return true;
  }

  // If all of the notes selected are more than half of the measure duration, then
  // it will be impossible to fill a complete measure
  if (
    possibleNoteDefinitions.every(
      (noteDefinition) => noteDefinition.duration > durationPerMeasure / 2
    )
  ) {
    return false;
  }

  return true;
};

const getRandomMeasure = (
  possibleNoteTypes: NoteType[],
  durationPerMeasure: number
): NoteDefinition[] => {
  if (!validateNoteSelection(possibleNoteTypes, durationPerMeasure)) {
    throw new Error('This combination of notes is not valid');
  }

  let randomMeasure: NoteDefinition[] = [];
  let totalDuration: number = 0;

  let loopCount = 0;

  while (totalDuration < durationPerMeasure) {
    const nextPossibleNote = getRandomNoteDefinition(possibleNoteTypes);

    if (nextPossibleNote.duration + totalDuration > durationPerMeasure) {
      if (loopCount > MAX_LOOP_COUNT) {
        throw new Error('Loop detected while building random measure');
      }

      loopCount++;
      continue;
    }

    randomMeasure.push(nextPossibleNote);
    totalDuration = getTotalDuration(randomMeasure);
    loopCount = 0;
  }

  return randomMeasure;
};

export const getRandomMeasures = (
  possibleNoteTypes: NoteType[],
  durationPerMeasure: number,
  measureCount: number
): NoteDefinition[][] => {
  let measures: NoteDefinition[][] = [];

  for (let i = 0; i < measureCount; i++) {
    measures.push(getRandomMeasure(possibleNoteTypes, durationPerMeasure));
  }

  return measures;
};
