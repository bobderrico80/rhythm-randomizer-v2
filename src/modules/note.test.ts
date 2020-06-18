import {
  getNoteDefinition,
  getNoteDefinitions,
  getTotalDuration,
  NoteType,
} from './note';

describe('The note module', () => {
  describe('getNoteDefinition() function', () => {
    it('gets the expected note definition', () => {
      expect(getNoteDefinition(NoteType.N1)).toEqual({
        type: NoteType.N1,
        duration: 4,
        svg: require('../svg/notes/n1.svg'),
        className: 'note--n1',
      });
    });
  });

  describe('getNoteDefinitions() function', () => {
    it('gets an array of the expected note definitions', () => {
      expect(getNoteDefinitions(NoteType.N1, NoteType.R1)).toEqual([
        {
          type: NoteType.N1,
          duration: 4,
          svg: require('../svg/notes/n1.svg'),
          className: 'note--n1',
        },
        {
          type: NoteType.R1,
          duration: 4,
          svg: require('../svg/notes/r1.svg'),
          className: 'note--r1',
        },
      ]);
    });
  });

  describe('getTotalDuration() function', () => {
    it('returns the total duration of the provided note definitions', () => {
      expect(
        getTotalDuration(getNoteDefinitions(NoteType.N1, NoteType.N2))
      ).toEqual(6);
    });
  });
});
