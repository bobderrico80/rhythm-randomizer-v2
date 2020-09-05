import {
  getTimeSignature,
  TimeSignatureType,
  TimeSignatureComplexity,
} from './time-signature';

describe('The time-signature module', () => {
  describe('getTimeSignature() function', () => {
    it('returns the requested time signature object', () => {
      expect(getTimeSignature(TimeSignatureType.SIMPLE_4_4)).toMatchObject({
        type: TimeSignatureType.SIMPLE_4_4,
        complexity: TimeSignatureComplexity.SIMPLE,
        beatsPerMeasure: 4,
        description: '4/4 time signature',
      });
    });
  });
});
