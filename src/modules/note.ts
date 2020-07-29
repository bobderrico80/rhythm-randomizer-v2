import { ScoreElementDefinition } from './score';
import { findDefinition } from './util';
import { widthUnitTypes } from './dimension';

export enum NoteType {
  N1 = 'n1',
  N2 = 'n2',
  N2D = 'n2d',
  N4 = 'n4',
  N4D_N8 = 'n4d-n8',
  N4T_N4T_N4T = 'n4t-n4t-n4t',
  N8_N4D = 'n8-n4d',
  N8_N8 = 'n8-n8',
  N8_N16_N16 = 'n8-n16-n16',
  N8_R8 = 'n8-r8',
  N8D_N16 = 'n8d-n16',
  N8T_N8T_N8T = 'n8t-n8t-n8t',
  N16_N8_N16 = 'n16-n8-n16',
  N16_N8D = 'n16-n8d',
  N16_N16_N8 = 'n16-n16-n8',
  N16_N16_N16_N16 = 'n16-n16-n16-n16',
  N16_N16_R8 = 'n16-n16-r8',
  R1 = 'r1',
  R2 = 'r2',
  R4 = 'r4',
  R8_N8 = 'r8-n8',
  R8_N16_N16 = 'r8-n16-n16',
}

export interface NoteDefinition extends ScoreElementDefinition<NoteType> {
  duration: number;
}

const createNoteDefinition = (
  type: NoteType,
  duration: number,
  description: string,
  widthUnit: number
): NoteDefinition => {
  return {
    type,
    duration,
    svgPath: `notes/${type}`,
    description,
    widthUnit,
  };
};

const noteDefinitions: NoteDefinition[] = [
  createNoteDefinition(
    NoteType.N1,
    4,
    'a whole note',
    widthUnitTypes.FULL_MEASURE
  ),
  createNoteDefinition(
    NoteType.N2,
    2,
    'a half note',
    widthUnitTypes.HALF_MEASURE
  ),
  createNoteDefinition(
    NoteType.N2D,
    3,
    'a dotted half note',
    widthUnitTypes.THREE_QUARTER_MEASURE
  ),
  createNoteDefinition(
    NoteType.N4,
    1,
    'a quarter note',
    widthUnitTypes.QUARTER_MEASURE
  ),
  createNoteDefinition(
    NoteType.N4D_N8,
    2,
    'a dotted quarter note and an 8th note',
    widthUnitTypes.HALF_MEASURE_DIV_2
  ),
  createNoteDefinition(
    NoteType.N4T_N4T_N4T,
    2,
    ' a quarter note triplet',
    widthUnitTypes.HALF_MEASURE_DIV_3
  ),
  createNoteDefinition(
    NoteType.N8_N4D,
    2,
    'an 8th note and dotted quarter note',
    widthUnitTypes.HALF_MEASURE_DIV_2
  ),
  createNoteDefinition(
    NoteType.N8_N8,
    1,
    'two beamed 8th notes',
    widthUnitTypes.QUARTER_MEASURE_DIV_2
  ),
  createNoteDefinition(
    NoteType.N8_N16_N16,
    1,
    'an 8th note and note 16th notes, beamed',
    widthUnitTypes.QUARTER_MEASURE_DIV_3
  ),
  createNoteDefinition(
    NoteType.N8_R8,
    1,
    'an 8th note and an 8th rest',
    widthUnitTypes.QUARTER_MEASURE_DIV_2
  ),
  createNoteDefinition(
    NoteType.N8D_N16,
    1,
    'a dotted 8th note and a 16th note, beamed',
    widthUnitTypes.QUARTER_MEASURE_DIV_2
  ),
  createNoteDefinition(
    NoteType.N8T_N8T_N8T,
    1,
    'an 8th note triplet',
    widthUnitTypes.QUARTER_MEASURE_DIV_3
  ),
  createNoteDefinition(
    NoteType.N16_N8_N16,
    1,
    'a 16th note, an 8th note, and a 16th note, beamed',
    widthUnitTypes.QUARTER_MEASURE_DIV_3
  ),
  createNoteDefinition(
    NoteType.N16_N8D,
    1,
    'a 16th note and a dotted 8th note, beamed',
    widthUnitTypes.QUARTER_MEASURE_DIV_2
  ),
  createNoteDefinition(
    NoteType.N16_N16_N8,
    1,
    'two 16th notes and an 8th note, beamed',
    widthUnitTypes.QUARTER_MEASURE_DIV_3
  ),
  createNoteDefinition(
    NoteType.N16_N16_R8,
    1,
    'two beamed 16th notes and an 8th rest',
    widthUnitTypes.QUARTER_MEASURE_DIV_3
  ),
  createNoteDefinition(
    NoteType.N16_N16_N16_N16,
    1,
    'four beamed 16th notes',
    widthUnitTypes.QUARTER_MEASURE_DIV_4
  ),
  createNoteDefinition(
    NoteType.N16_N16_N8,
    1,
    'two 16th notes and an 8th note, beamed',
    widthUnitTypes.QUARTER_MEASURE_DIV_3
  ),
  createNoteDefinition(
    NoteType.R1,
    4,
    'a whole rest',
    widthUnitTypes.FULL_MEASURE
  ),
  createNoteDefinition(
    NoteType.R2,
    2,
    'a half rest',
    widthUnitTypes.HALF_MEASURE
  ),
  createNoteDefinition(
    NoteType.R4,
    1,
    'a quarter rest',
    widthUnitTypes.QUARTER_MEASURE
  ),
  createNoteDefinition(
    NoteType.R8_N8,
    1,
    'an 8th rest and an 8th note',
    widthUnitTypes.QUARTER_MEASURE_DIV_2
  ),
  createNoteDefinition(
    NoteType.R8_N16_N16,
    1,
    'an 8th rest and two beamed 16th notes',
    widthUnitTypes.QUARTER_MEASURE_DIV_3
  ),
];

export const getNoteDefinition = (type: NoteType): NoteDefinition => {
  return findDefinition<NoteType, NoteDefinition>(type, noteDefinitions);
};

export const getNoteDefinitions = (...types: NoteType[]): NoteDefinition[] => {
  return types.map(getNoteDefinition);
};

export const getTotalDuration = (noteDefinitions: NoteDefinition[]): number => {
  return noteDefinitions.reduce((sum, noteDefinition) => {
    return sum + noteDefinition.duration;
  }, 0);
};
