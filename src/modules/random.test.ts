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
import { getTimeSignature, TimeSignatureType } from './time-signature';

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
});
