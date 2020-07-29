import { ScoreElementDefinition } from './score';
import { findDefinition } from './util';
import { widthUnitTypes } from './dimension';

export enum ClefType {
  PERCUSSION = 'percussion-clef',
}

export interface ClefDefinition extends ScoreElementDefinition<ClefType> {}

const createDefinition = (
  type: ClefType,
  description: string,
  widthUnit: number
): ClefDefinition => {
  return {
    type,
    svgPath: `clefs/${type}`,
    description,
    widthUnit,
  };
};

const definitions: ClefDefinition[] = [
  createDefinition(ClefType.PERCUSSION, 'percussion clef', widthUnitTypes.CLEF),
];

export const getClefDefinition = (type: ClefType) => {
  return findDefinition<ClefType, ClefDefinition>(type, definitions);
};
