import {
  getDuration,
  getRandomItems,
  getRandomMeasures,
  Randomizable,
  randomizeNoteSubGroups,
} from './random';
import {
  getTotalDuration,
  getNoteGroupTypeSelectionMap,
  resetNoteGroupTypeSelectionMap,
} from './note';
import {
  NoteGroupType,
  NoteGroupTypeSelectionMap,
  createNote,
  DynamicNoteGroup,
  NoteGroupCategoryType,
  NoteType,
} from './note-definition';
import { InvalidNoteSelectionError } from './error';
import { Measure } from './vex';
import {
  getTimeSignature,
  TimeSignatureComplexity,
  TimeSignatureType,
} from './time-signature';
import { duplicate } from './util';

const setNoteGroupTypeSelections = (
  noteGroupTypes: NoteGroupType[],
  noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap
) => {
  for (const noteGroupType of noteGroupTypes) {
    noteGroupTypeSelectionMap = noteGroupTypeSelectionMap.set(
      noteGroupType,
      true
    );
  }

  return noteGroupTypeSelectionMap;
};

interface TestItem extends Randomizable {
  name: string;
}

describe('The random module', () => {
  let noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap;

  beforeEach(() => {
    noteGroupTypeSelectionMap = resetNoteGroupTypeSelectionMap(
      getNoteGroupTypeSelectionMap()
    );
  });

  describe('getRandomItems() function', () => {
    const items: TestItem[] = [
      { name: 'foo', duration: 2 },
      { name: 'bar', duration: 4 },
    ];

    it('contains items that add up to the target duration', () => {
      const randomItems = getRandomItems(items, 4);
      expect(randomItems.reduce((t, i) => t + getDuration(i, 4), 0)).toEqual(4);
    });

    it('only includes item combinations that meet the include predicate, if provided', () => {
      const randomItems = getRandomItems(items, 4, (itemsSoFar) => {
        return itemsSoFar.every((item) => item.name === 'foo');
      });
      expect(randomItems).toEqual([
        { name: 'foo', duration: 2 },
        { name: 'foo', duration: 2 },
      ]);
    });

    it('throws an error if any one of the items has a duration larger than the target duration', () => {
      expect(() => {
        getRandomItems(items, 3);
      }).toThrowError();
    });

    it('throws an error in scenarios that are impossible to fill', () => {
      expect(() => {
        getRandomItems([{ name: 'foo', duration: 3 }], 4);
      }).toThrowError();
    });
  });

  describe('getRandomMeasures() function', () => {
    describe('happy path', () => {
      const noteGroupTypes = [
        NoteGroupType.W,
        NoteGroupType.H,
        NoteGroupType.Q,
        NoteGroupType.CQD,
      ];
      let measures: Measure[];
      const timeSignature = getTimeSignature(TimeSignatureType.SIMPLE_3_4);

      beforeEach(() => {
        noteGroupTypeSelectionMap = setNoteGroupTypeSelections(
          noteGroupTypes,
          noteGroupTypeSelectionMap
        );
        measures = getRandomMeasures(
          noteGroupTypeSelectionMap,
          timeSignature,
          4
        );
      });

      it('returns the expected number of measures', () => {
        expect(measures.length).toEqual(4);
      });

      it('returns measures with the expected duration', () => {
        measures.forEach((measure) => {
          expect(getTotalDuration(measure.noteGroups)).toEqual(3);
        });
      });

      it('contains only expected note definitions', () => {
        measures.forEach((measure) => {
          measure.noteGroups.forEach((noteGroup) => {
            expect(noteGroupTypes).toContain(noteGroup.type);
          });
        });
      });

      it('does not contain note definitions that are too large for the time signature', () => {
        measures.forEach((measure) => {
          measure.noteGroups.forEach((noteGroup) => {
            expect(noteGroup.type).not.toEqual(NoteGroupType.W);
          });
        });
      });

      it('does not contain note definitions that have a different complexity than the time signature', () => {
        measures.forEach((measure) => {
          measure.noteGroups.forEach((noteGroup) => {
            expect(noteGroup.type).not.toEqual(NoteGroupType.CQD);
          });
        });
      });
    });

    describe('with no note group types', () => {
      it('throws an InvalidNoteSelectionError', () => {
        expect(() => {
          getRandomMeasures(
            noteGroupTypeSelectionMap,
            getTimeSignature(TimeSignatureType.SIMPLE_4_4),
            4
          );
        }).toThrow(InvalidNoteSelectionError);
      });
    });

    describe('with a note group type larger than the duration per measure', () => {
      beforeEach(() => {
        noteGroupTypeSelectionMap = setNoteGroupTypeSelections(
          [NoteGroupType.W],
          noteGroupTypeSelectionMap
        );
      });
      it('throws an InvalidNoteSelectionError', () => {
        expect(() => {
          getRandomMeasures(
            noteGroupTypeSelectionMap,
            getTimeSignature(TimeSignatureType.SIMPLE_2_4),
            4
          );
        }).toThrow(InvalidNoteSelectionError);
      });
    });

    describe('with a single note type that would prevent a full measure from being completed', () => {
      beforeEach(() => {
        noteGroupTypeSelectionMap = setNoteGroupTypeSelections(
          [NoteGroupType.HD],
          noteGroupTypeSelectionMap
        );
      });
      it('throws an InvalidNoteSelectionError', () => {
        expect(() => {
          getRandomMeasures(
            noteGroupTypeSelectionMap,
            getTimeSignature(TimeSignatureType.SIMPLE_4_4),
            4
          );
        }).toThrow(InvalidNoteSelectionError);
      });
    });
  });

  describe('randomizeNoteSubGroups() function', () => {
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

    it('returns a random array of notes selected from the note template', () => {
      randomizeNoteSubGroups(dynamicNoteGroup).forEach((note) => {
        expect([NoteType.E, NoteType.S]).toContain(note.type);
      });
    });

    it('also handles includePredicates', () => {
      const dynamicNoteGroupWithPredicate: DynamicNoteGroup = {
        ...dynamicNoteGroup,
        includePredicate: (subGroupsSoFar) => {
          return subGroupsSoFar.every((subGroup) => {
            return subGroup.notes.every((note) => note.type === NoteType.S);
          });
        },
      };

      randomizeNoteSubGroups(dynamicNoteGroupWithPredicate).forEach((note) => {
        expect(note.type).toEqual(NoteType.S);
      });
    });
  });

  describe('getDuration() function', () => {
    it('returns the expected duration for an item with a static duration', () => {
      expect(getDuration({ duration: 4 }, 4)).toEqual(4);
    });

    it('returns the expected duration for an item with a dynamic duration', () => {
      expect(
        getDuration(
          { duration: (targetDuration: number) => targetDuration / 2 },
          4
        )
      ).toEqual(2);
    });
  });
});
