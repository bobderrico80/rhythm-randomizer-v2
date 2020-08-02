import {
  getNoteGroup,
  getNoteGroups,
  getTotalDuration,
  NoteGroupType,
  NoteType,
} from './note';

describe('The note module', () => {
  describe('getNoteGroup() function', () => {
    it('gets the expected note group', () => {
      expect(getNoteGroup(NoteGroupType.W)).toEqual({
        type: NoteGroupType.W,
        notes: [{ type: NoteType.W, dotted: false, widthUnit: 13 }],
        description: 'a whole note',
        duration: 4,
      });
    });
  });

  describe('getNoteGroups() function', () => {
    it('gets an array of the expected note groups', () => {
      expect(getNoteGroups(NoteGroupType.W, NoteGroupType.WR)).toEqual([
        {
          type: NoteGroupType.W,
          notes: [{ type: NoteType.W, dotted: false, widthUnit: 13 }],
          description: 'a whole note',
          duration: 4,
        },
        {
          type: NoteGroupType.WR,
          notes: [{ type: NoteType.WR, dotted: false, widthUnit: 13 }],
          description: 'a whole rest',
          duration: 4,
        },
      ]);
    });
  });

  describe('getTotalDuration() function', () => {
    it('returns the total duration of the provided note groups', () => {
      expect(
        getTotalDuration(getNoteGroups(NoteGroupType.W, NoteGroupType.H))
      ).toEqual(6);
    });
  });
});
