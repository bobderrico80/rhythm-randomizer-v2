// @ts-nocheck
// TODO: Fix all of this with the new types

import {
  getNoteDefinition,
  getNoteDefinitions,
  getTotalDuration,
  NoteGroupType,
} from './note';

describe('The note module', () => {
  describe('getNoteDefinition() function', () => {
    it('gets the expected note definition', () => {
      expect(getNoteDefinition(NoteGroupType.N1)).toEqual({
        type: NoteGroupType.N1,
        duration: 4,
        svg: require('../svg/notes/n1.svg'),
        description: 'a whole note',
      });
    });
  });

  describe('getNoteDefinitions() function', () => {
    it('gets an array of the expected note definitions', () => {
      expect(getNoteDefinitions(NoteGroupType.N1, NoteGroupType.R1)).toEqual([
        {
          type: NoteGroupType.N1,
          duration: 4,
          svg: require('../svg/notes/n1.svg'),
          description: 'a whole note',
        },
        {
          type: NoteGroupType.R1,
          duration: 4,
          svg: require('../svg/notes/r1.svg'),
          description: 'a whole rest',
        },
      ]);
    });
  });

  describe('getTotalDuration() function', () => {
    it('returns the total duration of the provided note definitions', () => {
      expect(
        getTotalDuration(getNoteDefinitions(NoteGroupType.N1, NoteGroupType.N2))
      ).toEqual(6);
    });
  });
});
