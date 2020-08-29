import {
  getNoteGroup,
  getNoteGroups,
  getTotalDuration,
  NoteGroupType,
  NoteType,
  categorizeNoteGroups,
  NoteGroupCategory,
} from './note';

describe('The note module', () => {
  describe('getNoteGroup() function', () => {
    it('gets the expected note group', () => {
      expect(getNoteGroup(NoteGroupType.W)).toMatchObject({
        category: NoteGroupCategory.BASIC_NOTES,
        type: NoteGroupType.W,
        notes: [{ type: NoteType.W, dotted: false, widthUnit: 13 }],
        description: 'a whole note',
        duration: 4,
      });
    });
  });

  describe('getNoteGroups() function', () => {
    it('gets an array of the expected note groups', () => {
      expect(getNoteGroups(NoteGroupType.W, NoteGroupType.WR)).toMatchObject([
        {
          category: NoteGroupCategory.BASIC_NOTES,
          type: NoteGroupType.W,
          notes: [{ type: NoteType.W, dotted: false, widthUnit: 13 }],
          description: 'a whole note',
          duration: 4,
        },
        {
          category: NoteGroupCategory.BASIC_RESTS,
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

  describe('categorizeNoteGroups() function', () => {
    describe('with note groups in the same category', () => {
      it('puts same-category note groups into the same categorized note group object', () => {
        expect(
          categorizeNoteGroups(
            getNoteGroups(NoteGroupType.W, NoteGroupType.H, NoteGroupType.Q)
          )
        ).toEqual([
          {
            category: NoteGroupCategory.BASIC_NOTES,
            noteGroups: getNoteGroups(
              NoteGroupType.W,
              NoteGroupType.H,
              NoteGroupType.Q
            ),
          },
        ]);
      });
    });

    describe('with note groups in different categories', () => {
      it('puts different-category note groups into the separate categorized note group objects', () => {
        expect(
          categorizeNoteGroups(
            getNoteGroups(NoteGroupType.W, NoteGroupType.H, NoteGroupType.QR)
          )
        ).toEqual([
          {
            category: NoteGroupCategory.BASIC_NOTES,
            noteGroups: getNoteGroups(NoteGroupType.W, NoteGroupType.H),
          },
          {
            category: NoteGroupCategory.BASIC_RESTS,
            noteGroups: getNoteGroups(NoteGroupType.QR),
          },
        ]);
      });
    });
  });
});
