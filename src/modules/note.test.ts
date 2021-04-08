import {
  getNoteGroup,
  getNoteGroups,
  getTotalDuration,
  NoteGroupType,
  NoteType,
  NoteGroupCategoryType,
  resetNoteGroupTypeSelectionMap,
  getNoteGroupTypeSelectionMap,
  getSelectedNoteGroupTypes,
  NoteGroupTypeSelectionMap,
  setNoteGroupTypeSelections,
  getPlaybackPatternsForNoteGroup,
  isValidNoteGroupForTimeSignature,
  getGeneratedNoteGroups,
  getGeneratedNoteGroup,
  generateNoteGroup,
  createNote,
  generateNoteGroups,
  DynamicNoteGroup,
  GeneratedNoteGroup,
  StaticNoteGroup,
} from './note';
import {
  getTimeSignature,
  TimeSignature,
  TimeSignatureComplexity,
  TimeSignatureType,
} from './time-signature';
import { duplicate } from './util';

describe('The note module', () => {
  describe('getNoteGroup() function', () => {
    it('gets the expected note group', () => {
      expect(getNoteGroup(NoteGroupType.W)).toMatchObject({
        categoryType: NoteGroupCategoryType.BASIC_NOTES,
        type: NoteGroupType.W,
        notes: [{ type: NoteType.W, dotted: false, widthUnit: 13 }],
        description: 'aWholeNote',
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
          description: 'aWholeNote',
          duration: 4,
        },
        {
          categoryType: NoteGroupCategoryType.BASIC_RESTS,
          type: NoteGroupType.WR,
          notes: [
            { type: NoteType.W, rest: true, dotted: false, widthUnit: 13 },
          ],
          description: 'aWholeRest',
          duration: 4,
        },
      ]);
    });
  });

  describe('getTotalDuration() function', () => {
    it('returns the total duration of the provided note groups', () => {
      expect(
        getTotalDuration(
          getGeneratedNoteGroups(NoteGroupType.W, NoteGroupType.H)
        )
      ).toEqual(6);
    });
  });

  describe('resetNoteGroupTypeSelectionMap() function', () => {
    it('resets all note group type selections to `false`', () => {
      const resetMap = resetNoteGroupTypeSelectionMap(
        getNoteGroupTypeSelectionMap()
      );

      [...resetMap.entries()].forEach(([_, value]) => {
        expect(value).toEqual(false);
      });
    });
  });

  describe('setNoteGroupTypeSelections() function', () => {
    let noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap;

    beforeEach(() => {
      noteGroupTypeSelectionMap = resetNoteGroupTypeSelectionMap(
        getNoteGroupTypeSelectionMap()
      );
      noteGroupTypeSelectionMap = noteGroupTypeSelectionMap.set(
        NoteGroupType.W,
        true
      );
      noteGroupTypeSelectionMap = setNoteGroupTypeSelections(
        noteGroupTypeSelectionMap,
        true,
        NoteGroupType.H,
        NoteGroupType.Q
      );
    });

    it('sets the specified note group types to `true`', () => {
      expect(noteGroupTypeSelectionMap.get(NoteGroupType.H)).toEqual(true);
      expect(noteGroupTypeSelectionMap.get(NoteGroupType.Q)).toEqual(true);
    });

    it('if `reset` is true, sets all other note group types to `false', () => {
      expect(noteGroupTypeSelectionMap.get(NoteGroupType.W)).toEqual(false);
    });

    it('if `reset` is false, does not affect other note group types', () => {
      noteGroupTypeSelectionMap = resetNoteGroupTypeSelectionMap(
        getNoteGroupTypeSelectionMap()
      ).set(NoteGroupType.W, true);

      noteGroupTypeSelectionMap = setNoteGroupTypeSelections(
        noteGroupTypeSelectionMap,
        false,
        NoteGroupType.H
      );

      expect(noteGroupTypeSelectionMap.get(NoteGroupType.W)).toEqual(true);
      expect(noteGroupTypeSelectionMap.get(NoteGroupType.H)).toEqual(true);
    });
  });

  describe('getSelectedNoteGroupTypes() function', () => {
    let timeSignature: TimeSignature;
    let noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap;

    beforeEach(() => {
      timeSignature = getTimeSignature(TimeSignatureType.SIMPLE_4_4);
      noteGroupTypeSelectionMap = resetNoteGroupTypeSelectionMap(
        getNoteGroupTypeSelectionMap()
      );
    });

    it('returns an array of all note group types that are mapped to the value of `true`', () => {
      noteGroupTypeSelectionMap = noteGroupTypeSelectionMap
        .set(NoteGroupType.W, true)
        .set(NoteGroupType.H, true)
        .set(NoteGroupType.Q, true);

      expect(
        getSelectedNoteGroupTypes(noteGroupTypeSelectionMap, timeSignature)
      ).toEqual([NoteGroupType.H, NoteGroupType.Q, NoteGroupType.W]);
    });

    it('returns an empty array if all note group types are mapped to the value of `false`', () => {
      let noteGroupTypeSelectionMap = resetNoteGroupTypeSelectionMap(
        getNoteGroupTypeSelectionMap()
      );

      expect(
        getSelectedNoteGroupTypes(noteGroupTypeSelectionMap, timeSignature)
      ).toEqual([]);
    });

    it('does not include note groups that have durations too large for the current time signature', () => {
      timeSignature = getTimeSignature(TimeSignatureType.SIMPLE_3_4);
      noteGroupTypeSelectionMap = noteGroupTypeSelectionMap
        .set(NoteGroupType.W, true)
        .set(NoteGroupType.H, true)
        .set(NoteGroupType.Q, true);

      expect(
        getSelectedNoteGroupTypes(noteGroupTypeSelectionMap, timeSignature)
      ).toEqual([NoteGroupType.H, NoteGroupType.Q]);
    });

    it('does not include note groups that have differing complexity from the current time signature', () => {
      timeSignature = getTimeSignature(TimeSignatureType.COMPOUND_6_8);
      noteGroupTypeSelectionMap = noteGroupTypeSelectionMap
        .set(NoteGroupType.H, true)
        .set(NoteGroupType.CHD, true);

      expect(
        getSelectedNoteGroupTypes(noteGroupTypeSelectionMap, timeSignature)
      ).toEqual([NoteGroupType.CHD]);
    });
  });

  describe('getPlaybackPatternsForNoteGroup() function', () => {
    it('handles single-note note groups', () => {
      expect(
        getPlaybackPatternsForNoteGroup(
          getGeneratedNoteGroup(NoteGroupType.W),
          getTimeSignature(TimeSignatureType.SIMPLE_4_4)
        )
      ).toEqual([
        {
          rest: false,
          toneDuration: '1n',
        },
      ]);
    });

    it('handles multi note note-groups', () => {
      expect(
        getPlaybackPatternsForNoteGroup(
          getGeneratedNoteGroup(NoteGroupType.EE),
          getTimeSignature(TimeSignatureType.SIMPLE_4_4)
        )
      ).toEqual([
        {
          rest: false,
          toneDuration: '8n',
        },
        {
          rest: false,
          toneDuration: '8n',
        },
      ]);
    });

    it('handles rests', () => {
      expect(
        getPlaybackPatternsForNoteGroup(
          getGeneratedNoteGroup(NoteGroupType.WR),
          getTimeSignature(TimeSignatureType.SIMPLE_4_4)
        )
      ).toEqual([
        {
          rest: true,
          toneDuration: '1n',
        },
      ]);
    });

    it('handles dotted notes', () => {
      expect(
        getPlaybackPatternsForNoteGroup(
          getGeneratedNoteGroup(NoteGroupType.HD),
          getTimeSignature(TimeSignatureType.SIMPLE_4_4)
        )
      ).toEqual([
        {
          rest: false,
          toneDuration: '2n.',
        },
      ]);
    });

    it('handles tuplets', () => {
      expect(
        getPlaybackPatternsForNoteGroup(
          getGeneratedNoteGroup(NoteGroupType.TEEE),
          getTimeSignature(TimeSignatureType.SIMPLE_4_4)
        )
      ).toEqual([
        {
          rest: false,
          toneDuration: '8t',
        },
        {
          rest: false,
          toneDuration: '8t',
        },
        {
          rest: false,
          toneDuration: '8t',
        },
      ]);
    });

    describe('with a compound meter time signature', () => {
      it('converts non-tupleted notes into tupleted notes', () => {
        expect(
          getPlaybackPatternsForNoteGroup(
            getGeneratedNoteGroup(NoteGroupType.CEEE),
            getTimeSignature(TimeSignatureType.COMPOUND_6_8)
          )
        ).toEqual([
          {
            rest: false,
            toneDuration: '8t',
          },
          {
            rest: false,
            toneDuration: '8t',
          },
          {
            rest: false,
            toneDuration: '8t',
          },
        ]);
      });

      it('converts tupleted notes into non-tupleted notes', () => {
        expect(
          getPlaybackPatternsForNoteGroup(
            getGeneratedNoteGroup(NoteGroupType.CTEE),
            getTimeSignature(TimeSignatureType.COMPOUND_6_8)
          )
        ).toEqual([
          {
            rest: false,
            toneDuration: '8n',
          },
          {
            rest: false,
            toneDuration: '8n',
          },
        ]);
      });

      it('removes the dot from dotted notes', () => {
        expect(
          getPlaybackPatternsForNoteGroup(
            getGeneratedNoteGroup(NoteGroupType.CHD),
            getTimeSignature(TimeSignatureType.COMPOUND_6_8)
          )
        ).toEqual([
          {
            rest: false,
            toneDuration: '2n',
          },
        ]);
      });
    });
  });

  describe('isValidNoteGroupForTimeSignature() function', () => {
    it('returns true if the note group duration AND time signature complexity fit the given time signature', () => {
      expect(
        isValidNoteGroupForTimeSignature(
          getNoteGroup(NoteGroupType.W),
          getTimeSignature(TimeSignatureType.SIMPLE_4_4)
        )
      ).toEqual(true);
    });

    it('returns false if the note group duration is too large for the time signature', () => {
      expect(
        isValidNoteGroupForTimeSignature(
          getNoteGroup(NoteGroupType.W),
          getTimeSignature(TimeSignatureType.SIMPLE_3_4)
        )
      ).toEqual(false);
    });

    it('returns false if the note group time signature complexity does not match the time signature', () => {
      expect(
        isValidNoteGroupForTimeSignature(
          getNoteGroup(NoteGroupType.W),
          getTimeSignature(TimeSignatureType.COMPOUND_12_8)
        )
      ).toEqual(false);
    });
  });

  describe('generateNoteGroup() function', () => {
    describe('with static note groups', () => {
      it('maps the required properties as expected', () => {
        expect(generateNoteGroup(getNoteGroup(NoteGroupType.Q))).toEqual({
          type: NoteGroupType.Q,
          duration: 1,
          notes: [createNote(NoteType.Q)],
        });
      });

      it('handles beamed note groups as expected', () => {
        expect(generateNoteGroup(getNoteGroup(NoteGroupType.EE))).toEqual({
          type: NoteGroupType.EE,
          duration: 1,
          notes: duplicate(createNote(NoteType.E), 2),
          beam: true,
        });
      });

      it('handles dynamically beamed notes as expected', () => {
        const testNoteGroup: StaticNoteGroup = {
          categoryType: 'test' as NoteGroupCategoryType,
          type: 'test' as NoteGroupType,
          notes: duplicate(createNote(NoteType.E), 2),
          description: 'test',
          duration: 1,
          icon: '',
          defaultSelectionValue: false,
          index: 0,
          sortOrder: 0,
          timeSignatureComplexity: TimeSignatureComplexity.SIMPLE,
          beam: (notes) => notes.every((note) => note.type === NoteType.E),
        };
        expect(generateNoteGroup(testNoteGroup).beam).toEqual(true);
      });

      it('handles tuplet note groups as expected', () => {
        expect(generateNoteGroup(getNoteGroup(NoteGroupType.TQQQ))).toEqual({
          type: NoteGroupType.TQQQ,
          duration: 2,
          notes: duplicate(createNote(NoteType.Q), 3),
          tuplet: true,
        });
      });
    });

    describe('with dynamic note groups', () => {
      const dynamicNoteGroup: DynamicNoteGroup = {
        type: 'test' as NoteGroupType,
        categoryType: 'test' as NoteGroupCategoryType,
        sortOrder: 0,
        duration: 1,
        description: 'test dynamic note group',
        icon: 'test.svg',
        defaultSelectionValue: false,
        index: 0,
        timeSignatureComplexity: TimeSignatureComplexity.SIMPLE,
        noteTemplate: [
          { duration: 1, notes: [createNote(NoteType.E)] },
          { duration: 1, notes: duplicate(createNote(NoteType.S), 2) },
        ],
        subGroupTargetDuration: 2,
      };

      let generatedNoteGroup: GeneratedNoteGroup;

      beforeEach(() => {
        generatedNoteGroup = generateNoteGroup(dynamicNoteGroup);
      });

      it('contains notes that are found in the note template', () => {
        generatedNoteGroup.notes.forEach((note) => {
          expect([NoteType.E, NoteType.S]).toContain(note.type);
        });
      });
    });
  });

  describe('generateNoteGroups() function', () => {
    it('maps the required properties as expected', () => {
      expect(
        generateNoteGroups(getNoteGroups(NoteGroupType.Q, NoteGroupType.TEEE))
      ).toEqual([
        {
          type: NoteGroupType.Q,
          duration: 1,
          notes: [createNote(NoteType.Q)],
        },
        {
          type: NoteGroupType.TEEE,
          duration: 1,
          notes: duplicate(createNote(NoteType.E), 3),
          tuplet: true,
          beam: true,
        },
      ]);
    });
  });

  describe('getGeneratedNoteGroup() function', () => {
    describe('with static note groups', () => {
      it('gets the expected generated note group from the note group type', () => {
        expect(getGeneratedNoteGroup(NoteGroupType.TEEE)).toEqual({
          type: NoteGroupType.TEEE,
          duration: 1,
          notes: duplicate(createNote(NoteType.E), 3),
          beam: true,
          tuplet: true,
        });
      });
    });
  });

  describe('getGeneratedNoteGroups() function', () => {
    describe('with static note groups', () => {
      it('gets the expected generated note groups from the note group types', () => {
        expect(
          getGeneratedNoteGroups(NoteGroupType.Q, NoteGroupType.TEEE)
        ).toEqual([
          {
            type: NoteGroupType.Q,
            duration: 1,
            notes: [createNote(NoteType.Q)],
          },
          {
            type: NoteGroupType.TEEE,
            duration: 1,
            notes: duplicate(createNote(NoteType.E), 3),
            beam: true,
            tuplet: true,
          },
        ]);
      });
    });
  });

  describe('createNote() function', () => {
    it('creates a note with the expected properties', () => {
      expect(createNote(NoteType.Q)).toEqual({
        type: NoteType.Q,
        dotted: false,
        rest: false,
        widthUnit: 5,
        playbackUnit: '4',
      });
    });

    it('creates a rest with the expected properties', () => {
      expect(createNote(NoteType.Q, true)).toEqual({
        type: NoteType.Q,
        dotted: false,
        rest: true,
        widthUnit: 5,
        playbackUnit: '4',
      });
    });

    it('creates a dotted note with the expected properties', () => {
      expect(createNote(NoteType.Q, false, true)).toEqual({
        type: NoteType.Q,
        dotted: true,
        rest: false,
        widthUnit: 7.5,
        playbackUnit: '4',
      });
    });
  });
});
