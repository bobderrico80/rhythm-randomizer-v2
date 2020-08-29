import { getRandomMeasures } from './random';
import {
  NoteGroupType,
  getTotalDuration,
  getNoteGroupTypeSelectionMap,
  resetNoteGroupTypeSelectionMap,
  NoteGroupTypeSelectionMap,
} from './note';
import { InvalidNoteSelectionError } from './error';
import { Measure } from './vex';

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

describe('The random module', () => {
  let noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap;

  beforeEach(() => {
    noteGroupTypeSelectionMap = resetNoteGroupTypeSelectionMap(
      getNoteGroupTypeSelectionMap()
    );
  });

  describe('getRandomMeasures() function', () => {
    describe('happy path', () => {
      const noteGroupTypes = [
        NoteGroupType.W,
        NoteGroupType.WR,
        NoteGroupType.H,
      ];
      let measures: Measure[];

      beforeEach(() => {
        noteGroupTypeSelectionMap = setNoteGroupTypeSelections(
          noteGroupTypes,
          noteGroupTypeSelectionMap
        );
        measures = getRandomMeasures(noteGroupTypeSelectionMap, 4, 4);
      });

      it('returns the expected number of measures', () => {
        expect(measures.length).toEqual(4);
      });

      it('returns measures with the expected duration', () => {
        measures.forEach((measure) => {
          expect(getTotalDuration(measure.noteGroups)).toEqual(4);
        });
      });

      it('contains only expected note definitions', () => {
        measures.forEach((measure) => {
          measure.noteGroups.forEach((noteGroup) => {
            expect(noteGroupTypes).toContain(noteGroup.type);
          });
        });
      });
    });

    describe('with no note group types', () => {
      it('throws an InvalidNoteSelectionError', () => {
        expect(() => {
          getRandomMeasures(noteGroupTypeSelectionMap, 4, 4);
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
          getRandomMeasures(noteGroupTypeSelectionMap, 2, 4);
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
          getRandomMeasures(noteGroupTypeSelectionMap, 4, 4);
        }).toThrow(InvalidNoteSelectionError);
      });
    });

    describe('with a combination of note types that would prevent a full measure from being completed', () => {
      beforeEach(() => {
        noteGroupTypeSelectionMap = setNoteGroupTypeSelections(
          [NoteGroupType.HD, NoteGroupType.H],
          noteGroupTypeSelectionMap
        );
      });
      it('throws an InvalidNoteSelectionError', () => {
        expect(() => {
          getRandomMeasures(noteGroupTypeSelectionMap, 6, 4);
        }).toThrow(InvalidNoteSelectionError);
      });
    });
  });
});
