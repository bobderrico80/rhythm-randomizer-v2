import { getRandomMeasures } from './random';
import { NoteDefinition, NoteType, getTotalDuration } from './note';

describe('The random module', () => {
  describe('getRandomMeasures() function', () => {
    const noteTypes = [NoteType.N4, NoteType.R4, NoteType.N2];
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
