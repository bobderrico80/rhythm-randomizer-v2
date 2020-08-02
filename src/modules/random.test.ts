import { getRandomMeasures } from './random';
import { NoteGroupType, getTotalDuration } from './note';
import { Measure } from './score';
import { InvalidNoteSelectionError } from './error';

describe('The random module', () => {
  describe('getRandomMeasures() function', () => {
    describe('happy path', () => {
      const noteGroupTypes = [
        NoteGroupType.W,
        NoteGroupType.WR,
        NoteGroupType.H,
      ];
      let measures: Measure[];

      beforeEach(() => {
        measures = getRandomMeasures(noteGroupTypes, 4, 4);
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
          getRandomMeasures([], 4, 4);
        }).toThrow(InvalidNoteSelectionError);
      });
    });

    describe('with a note group type larger than the duration per measure', () => {
      it('throws an InvalidNoteSelectionError', () => {
        expect(() => {
          getRandomMeasures([NoteGroupType.W], 2, 4);
        }).toThrow(InvalidNoteSelectionError);
      });
    });

    describe('with a single note type that would prevent a full measure from being completed', () => {
      it('throws an InvalidNoteSelectionError', () => {
        expect(() => {
          getRandomMeasures([NoteGroupType.HD], 4, 4);
        }).toThrow(InvalidNoteSelectionError);
      });
    });

    describe('with a combination of note types that would prevent a full measure from being completed', () => {
      it('throws an InvalidNoteSelectionError', () => {
        expect(() => {
          getRandomMeasures([NoteGroupType.HD, NoteGroupType.H], 6, 4);
        }).toThrow(InvalidNoteSelectionError);
      });
    });
  });
});
