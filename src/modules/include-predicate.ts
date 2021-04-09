import { NoteSubGroup, NoteType } from './note-definition';

export const allRests = (subGroupsSoFar: NoteSubGroup[]) => {
  return subGroupsSoFar.every((subGroup) =>
    subGroup.notes.every((note) => note.rest)
  );
};

export const allNotes = (subGroupsSoFar: NoteSubGroup[]) => {
  return subGroupsSoFar.every((subGroup) =>
    subGroup.notes.every((note) => !note.rest)
  );
};

export const allOfType = (
  subGroupsSoFar: NoteSubGroup[],
  noteType: NoteType
) => {
  return subGroupsSoFar.every((subGroup) =>
    subGroup.notes.every((note) => note.type === noteType)
  );
};

export const anyOfType = (
  subGroupsSoFar: NoteSubGroup[],
  noteType: NoteType,
  rest?: boolean
) => {
  return subGroupsSoFar.some((subGroup) =>
    subGroup.notes.some((note) => {
      if (rest) {
        return note.type === noteType && note.rest;
      }

      return note.type === noteType;
    })
  );
};
