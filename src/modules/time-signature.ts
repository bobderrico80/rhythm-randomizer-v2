import { findItemOfType, TypedItem } from './util';

export enum TimeSignatureComplexity {
  SIMPLE,
  COMPOUND,
}

export enum TimeSignatureType {
  SIMPLE_2_4 = '2/4',
  SIMPLE_3_4 = '3/4',
  SIMPLE_4_4 = '4/4',
}

export interface TimeSignature extends TypedItem<TimeSignatureType> {
  type: TimeSignatureType;
  complexity: TimeSignatureComplexity;
  beatsPerMeasure: number;
  description: string;
  icon: string;
  index: number;
}

export const timeSignatures: TimeSignature[] = [
  {
    type: TimeSignatureType.SIMPLE_2_4,
    complexity: TimeSignatureComplexity.SIMPLE,
    beatsPerMeasure: 2,
    description: '2/4 time signature',
    icon: require('../svg/time-signatures/ts-2-4.svg').default,
    index: 0,
  },
  {
    type: TimeSignatureType.SIMPLE_3_4,
    complexity: TimeSignatureComplexity.SIMPLE,
    beatsPerMeasure: 3,
    description: '3/4 time signature',
    icon: require('../svg/time-signatures/ts-3-4.svg').default,
    index: 1,
  },
  {
    type: TimeSignatureType.SIMPLE_4_4,
    complexity: TimeSignatureComplexity.SIMPLE,
    beatsPerMeasure: 4,
    description: '4/4 time signature',
    icon: require('../svg/time-signatures/ts-4-4.svg').default,
    index: 2,
  },
];

export const getTimeSignature = (type: TimeSignatureType) => {
  return findItemOfType<TimeSignatureType, TimeSignature>(type, timeSignatures);
};
