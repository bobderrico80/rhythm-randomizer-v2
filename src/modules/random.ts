import {
  NoteType,
  NoteDefinition,
  getNoteDefinition,
  getTotalDuration,
} from './note';

const getRandomNoteDefinition = (
  possibleNoteTypes: NoteType[]
): NoteDefinition => {
  const randomIndex = Math.floor(Math.random() * possibleNoteTypes.length);
  const randomNoteType = possibleNoteTypes[randomIndex];
  return getNoteDefinition(randomNoteType);
};

const getRandomMeasure = (
  possibleNoteTypes: NoteType[],
  durationPerMeasure: number
): NoteDefinition[] => {
  let randomMeasure: NoteDefinition[] = [];
  let totalDuration: number = 0;

  while (totalDuration < durationPerMeasure) {
    const nextPossibleNote = getRandomNoteDefinition(possibleNoteTypes);

    if (nextPossibleNote.duration + totalDuration > durationPerMeasure) {
      continue;
    }

    randomMeasure.push(nextPossibleNote);
    totalDuration = getTotalDuration(randomMeasure);
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
