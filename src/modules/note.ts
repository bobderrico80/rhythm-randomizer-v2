export enum NoteType {
  N1 = 'n1',
  N2 = 'n2',
  N2D = 'n2d',
  N4 = 'n4',
  N4D_N8 = 'n4d-n8',
  N4T_N4T_N4T = 'n4t-n4t-n4t',
  N8_N4D = 'n8-n4d',
  N8_N8 = 'n8-n8',
  N8_N16_N16 = 'n8-n16-n16',
  N8_R8 = 'n8-r8',
  N8D_N16 = 'n8d-n16',
  N8T_N8T_N8T = 'n8t-n8t-n8t',
  N16_N8_N16 = 'n16-n8-n16',
  N16_N8D = 'n16-n8d',
  N16_N16_N8 = 'n16-n16-n8',
  N16_N16_N16_N16 = 'n16-n16-n16-n16',
  N16_N16_R8 = 'n16-n16-r8',
  R1 = 'r1',
  R2 = 'r2',
  R4 = 'r4',
  R8_N8 = 'r8-n8',
  R8_N16_N16 = 'r8-n16-n16',
}

export interface NoteDefinition {
  type: NoteType;
  duration: number;
  svg: string;
  className: string;
}

const createNoteDefinition = (
  noteType: NoteType,
  duration: number
): NoteDefinition => {
  return {
    type: noteType,
    duration,
    svg: require(`../svg/notes/${noteType}.svg`),
    className: `note--${noteType}`,
  };
};

const noteDefinitions: NoteDefinition[] = [
  createNoteDefinition(NoteType.N1, 4),
  createNoteDefinition(NoteType.N2, 2),
  createNoteDefinition(NoteType.N2D, 3),
  createNoteDefinition(NoteType.N4, 1),
  createNoteDefinition(NoteType.N4D_N8, 2),
  createNoteDefinition(NoteType.N4T_N4T_N4T, 2),
  createNoteDefinition(NoteType.N8_N4D, 2),
  createNoteDefinition(NoteType.N8_N8, 1),
  createNoteDefinition(NoteType.N8_N16_N16, 1),
  createNoteDefinition(NoteType.N8_R8, 1),
  createNoteDefinition(NoteType.N8D_N16, 1),
  createNoteDefinition(NoteType.N8T_N8T_N8T, 1),
  createNoteDefinition(NoteType.N16_N8_N16, 1),
  createNoteDefinition(NoteType.N16_N8D, 1),
  createNoteDefinition(NoteType.N16_N16_N8, 1),
  createNoteDefinition(NoteType.N16_N16_N16_N16, 1),
  createNoteDefinition(NoteType.N16_N16_N8, 1),
  createNoteDefinition(NoteType.R1, 4),
  createNoteDefinition(NoteType.R2, 2),
  createNoteDefinition(NoteType.R4, 1),
  createNoteDefinition(NoteType.R8_N8, 1),
  createNoteDefinition(NoteType.R8_N16_N16, 1),
];

export const getNoteDefinition = (noteType: NoteType): NoteDefinition => {
  const foundNoteDefinition = noteDefinitions.find(
    (noteDefinition) => noteDefinition.type === noteType
  );

  if (foundNoteDefinition) {
    return foundNoteDefinition;
  }

  throw new Error(`No note definition found for note type ${noteType}`);
};

export const getNoteDefinitions = (
  ...noteTypes: NoteType[]
): NoteDefinition[] => {
  return noteTypes.map(getNoteDefinition);
};

export const getTotalDuration = (noteDefinitions: NoteDefinition[]): number => {
  return noteDefinitions.reduce((sum, noteDefinition) => {
    return sum + noteDefinition.duration;
  }, 0);
};
