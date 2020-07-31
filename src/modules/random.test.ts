// @ts-nocheck
// TODO: Fix all of this with the new types
import { getRandomMeasures } from './random';
import { NoteDefinition, NoteGroupType, getTotalDuration } from './note';

describe('The random module', () => {
  describe('getRandomMeasures() function', () => {
    const noteTypes = [NoteGroupType.N4, NoteGroupType.R4, NoteGroupType.N2];
    let measures: NoteDefinition[][];

    beforeEach(() => {
      measures = getRandomMeasures(noteTypes, 4, 4);
    });

    it('returns the expected number of measures', () => {
      expect(measures.length).toEqual(4);
    });

    it('returns measures with the expected duration', () => {
      measures.forEach((measure) => {
        expect(getTotalDuration(measure)).toEqual(4);
      });
    });

    it('contains only expected note definitions', () => {
      measures.forEach((measure) => {
        measure.forEach((note) => {
          expect(noteTypes).toContain(note.type);
        });
      });
    });
  });
});
