import {
  getNoteGroup,
  getNoteGroups,
  getTotalDuration,
  NoteGroupType,
  NoteType,
  categorizeNoteGroups,
  NoteGroupCategoryType,
  resetNoteGroupTypeSelectionMap,
  getNoteGroupTypeSelectionMap,
  getSelectedNoteGroupTypes,
} from './note';

describe('The note module', () => {
  describe('getNoteGroup() function', () => {
    it('gets the expected note group', () => {
      expect(getNoteGroup(NoteGroupType.W)).toMatchObject({
        categoryType: NoteGroupCategoryType.BASIC_NOTES,
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
          categoryType: NoteGroupCategoryType.BASIC_NOTES,
          type: NoteGroupType.W,
          notes: [{ type: NoteType.W, dotted: false, widthUnit: 13 }],
          description: 'a whole note',
          duration: 4,
        },
        {
          categoryType: NoteGroupCategoryType.BASIC_RESTS,
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
            category: {
              type: NoteGroupCategoryType.BASIC_NOTES,
              sortOrder: 0,
            },
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
      it('puts different-category note groups into the separate categorized note group objects, with categories sorted by sortOrder', () => {
        expect(
          categorizeNoteGroups(
            getNoteGroups(NoteGroupType.QR, NoteGroupType.W, NoteGroupType.H)
          )
        ).toEqual([
          {
            category: { type: NoteGroupCategoryType.BASIC_NOTES, sortOrder: 0 },
            noteGroups: getNoteGroups(NoteGroupType.W, NoteGroupType.H),
          },
          {
            category: {
              type: NoteGroupCategoryType.BASIC_RESTS,
              sortOrder: 1,
            },
            noteGroups: getNoteGroups(NoteGroupType.QR),
          },
        ]);
      });
    });
  });

  describe('getNoteGroupTypeSelectionMap() function', () => {
    it('returns a map containing only note groups less than or equal to the max duration', () => {
      const map = getNoteGroupTypeSelectionMap(3);

      [...map.entries()].forEach(([noteGroupType]) => {
        expect(getNoteGroup(noteGroupType).duration).toBeLessThanOrEqual(3);
      });
    });
  });

  describe('resetNoteGroupTypeSelectionMap() function', () => {
    it('resets all note group type selections to `false`', () => {
      const resetMap = resetNoteGroupTypeSelectionMap(
        getNoteGroupTypeSelectionMap(4)
      );

      [...resetMap.entries()].forEach(([_, value]) => {
        expect(value).toEqual(false);
      });
    });
  });

  describe('getSelectedNoteGroupTypes() function', () => {
    it('returns an array of all note group types that are mapped to the value of `true`', () => {
      // Start with a mapping of all note group types selected as `false`
      let noteGroupTypeSelectionMap = resetNoteGroupTypeSelectionMap(
        getNoteGroupTypeSelectionMap(4)
      );

      noteGroupTypeSelectionMap = noteGroupTypeSelectionMap
        .set(NoteGroupType.W, true)
        .set(NoteGroupType.H, true)
        .set(NoteGroupType.Q, true);

      expect(getSelectedNoteGroupTypes(noteGroupTypeSelectionMap)).toEqual([
        NoteGroupType.H,
        NoteGroupType.Q,
        NoteGroupType.W,
      ]);
    });

    it('returns an empty array if all note group types are mapped to the value of `false`', () => {
      let noteGroupTypeSelectionMap = resetNoteGroupTypeSelectionMap(
        getNoteGroupTypeSelectionMap(4)
      );

      expect(getSelectedNoteGroupTypes(noteGroupTypeSelectionMap)).toEqual([]);
    });
  });
});
