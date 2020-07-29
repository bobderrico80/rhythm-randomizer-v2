import { ScoreElementDefinition } from './score';
import { findDefinition } from './util';
import { widthUnitTypes } from './dimension';

export enum BarlineType {
  SINGLE = 'single',
  FINAL = 'final',
}

export interface BarlineDefinition
  extends ScoreElementDefinition<BarlineType> {}

const createDefinition = (
  type: BarlineType,
  description: string,
  widthUnit: number
): BarlineDefinition => {
  return {
    type,
    svgPath: `barlines/${type}`,
    description,
    widthUnit,
  };
};

const definitions: BarlineDefinition[] = [
  createDefinition(
    BarlineType.SINGLE,
    'single barline',
    widthUnitTypes.SINGLE_BARLINE
  ),
  createDefinition(
    BarlineType.FINAL,
    'final barline',
    widthUnitTypes.DOUBLE_BARLINE
  ),
];

export const getBarlineDefinition = (type: BarlineType) => {
  return findDefinition<BarlineType, BarlineDefinition>(type, definitions);
};
