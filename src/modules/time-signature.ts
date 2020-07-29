import { ScoreElementDefinition } from './score';
import { findDefinition } from './util';
import { widthUnitTypes } from './dimension';

export enum TimeSignatureComplexity {
  SIMPLE,
  COMPOUND,
}

export enum TimeSignatureType {
  SIMPLE_2_4 = 'simple-2-4',
  SIMPLE_3_4 = 'simple-3-4',
  SIMPLE_4_4 = 'simple-4-4',
}

export interface TimeSignatureDefinition
  extends ScoreElementDefinition<TimeSignatureType> {
  beatsPerMeasure: number;
  complexity: TimeSignatureComplexity;
}

const createDefinition = (
  type: TimeSignatureType,
  beatsPerMeasure: number,
  complexity: TimeSignatureComplexity,
  description: string,
  widthUnit: number
): TimeSignatureDefinition => {
  return {
    type,
    beatsPerMeasure,
    complexity,
    svgPath: `time-signatures/${type}`,
    description,
    widthUnit,
  };
};

const definitions: TimeSignatureDefinition[] = [
  createDefinition(
    TimeSignatureType.SIMPLE_2_4,
    2,
    TimeSignatureComplexity.SIMPLE,
    '2/4 Time',
    widthUnitTypes.TIME_SIGNATURE
  ),
  createDefinition(
    TimeSignatureType.SIMPLE_3_4,
    3,
    TimeSignatureComplexity.SIMPLE,
    '3/4 Time',
    widthUnitTypes.TIME_SIGNATURE
  ),
  createDefinition(
    TimeSignatureType.SIMPLE_4_4,
    4,
    TimeSignatureComplexity.SIMPLE,
    '4/4 Time',
    widthUnitTypes.TIME_SIGNATURE
  ),
];

export const getTimeSignatureDefinition = (type: TimeSignatureType) => {
  return findDefinition<TimeSignatureType, TimeSignatureDefinition>(
    type,
    definitions
  );
};
