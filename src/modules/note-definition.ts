import { Map } from 'immutable';
import { allOfType, allNotes, allRests, anyOfType } from './include-predicate';
import { Randomizable } from './random';
import { TimeSignatureComplexity } from './time-signature';
import { CategorizableTypedItem, CategorizedItem, Category } from './util';

export enum NoteGroupCategoryType {
  // Simple meter categories
  BASIC_NOTES = 'basicNotes',
  COMPOUND_BASIC_NOTES = 'basicDottedNotes',
  BASIC_RESTS = 'basicRests',
  COMPOUND_BASIC_RESTS = 'basicDottedRests',
  SIMPLE_BEAMED_NOTES = 'simpleBeamedNotes',
  MIXED_BEAMED_NOTES = 'mixedBeamedNotes',
  TUPLETS = 'tuplets',
  DOTTED_NOTE_COMBINATIONS = 'dottedNoteCombinations',
  EIGHTH_REST_COMBINATIONS = '8thRestCombinations',
  SYNCOPATED_COMBINATIONS = 'syncopatedCombinations',
  COMPOUND_EIGHTH_NOTE_COMBINATIONS = 'compound8thNoteCombinations',
  COMPOUND_COMPLEX_COMBINATIONS = 'compoundComplexCombinations',
}

export enum NoteGroupType {
  // Basic notes
  W = 'w',
  H = 'h',
  Q = 'q',

  // Basic rests
  WR = 'wr',
  HR = 'hr',
  QR = 'qr',

  // Simple beamed notes
  EE = 'ee',
  SSSS = 'ssss',

  // Mixed beamed notes
  SSE = 'sse',
  SES = 'ses',
  ESS = 'ess',

  // Tuplets (T = tuplet)
  TQQQ = 'tqqq',
  TEEE = 'teee',

  // Dotted note combinations (D = dotted)
  HD = 'hd',
  WD = 'wd',
  QDE = 'qde',
  EQD = 'eqd',
  EDS = 'eds',
  SED = 'sed',

  // Combinations with 8th rests
  EER = 'eer',
  ERE = 'ere',
  SSER = 'sser',
  ERSS = 'erss',

  // Syncopated combinations
  EQE = 'eqe',
  EQQE = 'eqqe',
  EQQQE = 'eqqqe',

  // Compound Meter dotted notes (C prefix = Compound)
  CWD = 'cwd',
  CHD = 'chd',
  CQD = 'cqd',

  // Compound meter dotted rests
  CWDR = 'cwdr',
  CHDR = 'chdr',
  CQDR = 'cqdr',

  // Compound meter 8th note combinations
  CQE = 'cqe',
  CEQ = 'ceq',
  CEEE = 'ceee',
  CTEE = 'ctee',

  // Compound meter complex combinations (X = has note subgroup randomization)
  CXQQREER = 'cxqqreer',
  CXEER = 'cxeer',
  CXESS = 'cxess',
  CXQQRSS = 'cxqqrss',
  CXEERSS = 'cxeerss',
  CXEERSSR = 'cxeerssr',
}

export enum NoteType {
  // W = whole, H = half, Q = quarter, E = 8th, S = 16th
  W = 'w',
  H = 'h',
  Q = 'q',
  E = '8',
  S = '16',
}

export enum PitchClass {
  A = 'A',
  Bb = 'Bb',
  B = 'B',
  C = 'C',
  Db = 'Db',
  D = 'D',
  Eb = 'Eb',
  E = 'E',
  F = 'F',
  Gb = 'Gb',
  G = 'G',
  Ab = 'Ab',
}

export enum Octave {
  _0 = '0',
  _1 = '1',
  _2 = '2',
  _3 = '3',
  _4 = '4',
  _5 = '5',
  _6 = '6',
  _7 = '7',
}

export interface Note {
  type: string;
  widthUnit: number;
  playbackUnit: string;
  rest: boolean;
  dotted: boolean;
}

export interface GeneratedNoteGroup {
  type: NoteGroupType;
  notes: Note[];
  duration: number;
  tuplet?: boolean;
  beam?: boolean | string;
}

export interface NoteSubGroup extends Randomizable {
  notes: Note[];
}

interface BaseNoteGroup
  extends CategorizableTypedItem<NoteGroupType, NoteGroupCategoryType>,
    Randomizable {
  beam?: boolean | string | ((notes: Note[]) => boolean | string);
  tuplet?: boolean;
  description: string;
  icon: string;
  defaultSelectionValue: boolean;
  index: number;
  timeSignatureComplexity: TimeSignatureComplexity;
}

export interface StaticNoteGroup extends BaseNoteGroup {
  notes: Note[];
  noteTemplate?: never;
}

export interface DynamicNoteGroup extends BaseNoteGroup {
  notes?: never;
  noteTemplate: NoteSubGroup[];
  subGroupTargetDuration: number;
  includePredicate?: (subGroupsSoFar: NoteSubGroup[]) => boolean;
}

export type NoteGroup = StaticNoteGroup | DynamicNoteGroup;

export interface CategorizedNoteGroup
  extends CategorizedItem<NoteGroupCategory, NoteGroup> {}

export interface NoteGroupCategory extends Category<NoteGroupCategoryType> {}

export interface PlaybackPattern {
  toneDuration: string;
  rest: boolean;
  pitch?: Pitch;
  velocity?: number;
}
export interface Pitch {
  pitchClass: PitchClass;
  octave: Octave;
}

export type NoteGroupTypeSelectionMap = Map<NoteGroupType, Boolean>;

export const noteWidthUnitMap = {
  [NoteType.W]: 13,
  [NoteType.H]: 8,
  [NoteType.Q]: 5,
  [NoteType.E]: 3,
  [NoteType.S]: 1,
};

const notePlaybackUnitMap = {
  [NoteType.W]: '1',
  [NoteType.H]: '2',
  [NoteType.Q]: '4',
  [NoteType.E]: '8',
  [NoteType.S]: '16',
};

export const createNote = (
  type: NoteType,
  rest: boolean = false,
  dotted: boolean = false
): Note => {
  const playbackUnit = notePlaybackUnitMap[type];
  let widthUnit = noteWidthUnitMap[type];

  if (dotted) {
    widthUnit *= 1.5;
  }

  return {
    type,
    dotted,
    rest,
    widthUnit,
    playbackUnit,
  };
};

export const noteGroupCategories: NoteGroupCategory[] = [
  {
    type: NoteGroupCategoryType.BASIC_NOTES,
    sortOrder: 0,
  },
  {
    type: NoteGroupCategoryType.COMPOUND_BASIC_NOTES,
    sortOrder: 1,
  },
  {
    type: NoteGroupCategoryType.BASIC_RESTS,
    sortOrder: 2,
  },
  {
    type: NoteGroupCategoryType.COMPOUND_BASIC_RESTS,
    sortOrder: 3,
  },
  {
    type: NoteGroupCategoryType.SIMPLE_BEAMED_NOTES,
    sortOrder: 4,
  },
  {
    type: NoteGroupCategoryType.COMPOUND_EIGHTH_NOTE_COMBINATIONS,
    sortOrder: 5,
  },
  {
    type: NoteGroupCategoryType.MIXED_BEAMED_NOTES,
    sortOrder: 6,
  },
  {
    type: NoteGroupCategoryType.TUPLETS,
    sortOrder: 7,
  },
  {
    type: NoteGroupCategoryType.DOTTED_NOTE_COMBINATIONS,
    sortOrder: 8,
  },
  {
    type: NoteGroupCategoryType.EIGHTH_REST_COMBINATIONS,
    sortOrder: 9,
  },
  {
    type: NoteGroupCategoryType.SYNCOPATED_COMBINATIONS,
    sortOrder: 10,
  },
  {
    type: NoteGroupCategoryType.COMPOUND_COMPLEX_COMBINATIONS,
    sortOrder: 11,
  },
];

// Alias to make defining note groups less verbose
const c = createNote;

export const noteGroups: NoteGroup[] = [
  // Basic notes - Simple
  {
    categoryType: NoteGroupCategoryType.BASIC_NOTES,
    type: NoteGroupType.W,
    notes: [c(NoteType.W)],
    description: 'aWholeNote',
    duration: 4,
    icon: require('../svg/notes/w.svg').default,
    defaultSelectionValue: true,
    index: 0,
    sortOrder: 0,
    timeSignatureComplexity: TimeSignatureComplexity.SIMPLE,
  },
  {
    categoryType: NoteGroupCategoryType.BASIC_NOTES,
    type: NoteGroupType.H,
    notes: [c(NoteType.H)],
    description: 'aHalfNote',
    duration: 2,
    icon: require('../svg/notes/h.svg').default,
    defaultSelectionValue: true,
    index: 1,
    sortOrder: 1,
    timeSignatureComplexity: TimeSignatureComplexity.SIMPLE,
  },
  {
    categoryType: NoteGroupCategoryType.BASIC_NOTES,
    type: NoteGroupType.Q,
    notes: [c(NoteType.Q)],
    description: 'aQuarterNote',
    duration: 1,
    icon: require('../svg/notes/q.svg').default,
    defaultSelectionValue: true,
    index: 2,
    sortOrder: 2,
    timeSignatureComplexity: TimeSignatureComplexity.SIMPLE,
  },

  // Basic notes - Compound
  {
    categoryType: NoteGroupCategoryType.COMPOUND_BASIC_NOTES,
    type: NoteGroupType.CWD,
    notes: [c(NoteType.W, false, true)],
    description: 'aDottedWholeNote',
    duration: 4,
    icon: require('../svg/notes/cwd.svg').default,
    defaultSelectionValue: true,
    index: 25,
    sortOrder: 3,
    timeSignatureComplexity: TimeSignatureComplexity.COMPOUND,
  },
  {
    categoryType: NoteGroupCategoryType.COMPOUND_BASIC_NOTES,
    type: NoteGroupType.CHD,
    notes: [c(NoteType.H, false, true)],
    description: 'aDottedHalfNote',
    duration: 2,
    icon: require('../svg/notes/chd.svg').default,
    defaultSelectionValue: true,
    index: 26,
    sortOrder: 4,
    timeSignatureComplexity: TimeSignatureComplexity.COMPOUND,
  },
  {
    categoryType: NoteGroupCategoryType.COMPOUND_BASIC_NOTES,
    type: NoteGroupType.CQD,
    notes: [c(NoteType.Q, false, true)],
    description: 'aDottedQuarterNote',
    duration: 1,
    icon: require('../svg/notes/cqd.svg').default,
    defaultSelectionValue: true,
    index: 27,
    sortOrder: 5,
    timeSignatureComplexity: TimeSignatureComplexity.COMPOUND,
  },

  // Basic rests - simple
  {
    categoryType: NoteGroupCategoryType.BASIC_RESTS,
    type: NoteGroupType.WR,
    notes: [c(NoteType.W, true)],
    description: 'aWholeRest',
    duration: (beatsPerMeasure: number) => beatsPerMeasure,
    icon: require('../svg/notes/wr.svg').default,
    defaultSelectionValue: true,
    index: 3,
    sortOrder: 6,
    timeSignatureComplexity: TimeSignatureComplexity.SIMPLE,
  },
  {
    categoryType: NoteGroupCategoryType.BASIC_RESTS,
    type: NoteGroupType.HR,
    notes: [c(NoteType.H, true)],
    description: 'aHalfRest',
    duration: 2,
    icon: require('../svg/notes/hr.svg').default,
    defaultSelectionValue: true,
    index: 4,
    sortOrder: 7,
    timeSignatureComplexity: TimeSignatureComplexity.SIMPLE,
  },
  {
    categoryType: NoteGroupCategoryType.BASIC_RESTS,
    type: NoteGroupType.QR,
    notes: [c(NoteType.Q, true)],
    description: 'aQuarterRest',
    duration: 1,
    icon: require('../svg/notes/qr.svg').default,
    defaultSelectionValue: true,
    index: 5,
    sortOrder: 8,
    timeSignatureComplexity: TimeSignatureComplexity.SIMPLE,
  },

  // Dotted rests - compound
  {
    categoryType: NoteGroupCategoryType.COMPOUND_BASIC_RESTS,
    type: NoteGroupType.CWDR,
    notes: [c(NoteType.W, true, true)],
    description: 'aWholeRest',
    duration: (beatsPerMeasure: number) => beatsPerMeasure,
    icon: require('../svg/notes/cwr.svg').default,
    defaultSelectionValue: true,
    index: 28,
    sortOrder: 9,
    timeSignatureComplexity: TimeSignatureComplexity.COMPOUND,
  },
  {
    categoryType: NoteGroupCategoryType.COMPOUND_BASIC_RESTS,
    type: NoteGroupType.CHDR,
    notes: [c(NoteType.H, true, true)],
    description: 'aDottedHalfRest',
    duration: 2,
    icon: require('../svg/notes/chdr.svg').default,
    defaultSelectionValue: true,
    index: 29,
    sortOrder: 10,
    timeSignatureComplexity: TimeSignatureComplexity.COMPOUND,
  },
  {
    categoryType: NoteGroupCategoryType.COMPOUND_BASIC_RESTS,
    type: NoteGroupType.CQDR,
    notes: [c(NoteType.Q, true, true)],
    description: 'aDottedQuarterRest',
    duration: 1,
    icon: require('../svg/notes/cqdr.svg').default,
    defaultSelectionValue: true,
    index: 30,
    sortOrder: 11,
    timeSignatureComplexity: TimeSignatureComplexity.COMPOUND,
  },

  // Simple beamed notes
  {
    categoryType: NoteGroupCategoryType.SIMPLE_BEAMED_NOTES,
    type: NoteGroupType.EE,
    notes: [c(NoteType.E), c(NoteType.E)],
    beam: true,
    description: 'twoBeamed8thNotes',
    duration: 1,
    icon: require('../svg/notes/ee.svg').default,
    defaultSelectionValue: true,
    index: 6,
    sortOrder: 12,
    timeSignatureComplexity: TimeSignatureComplexity.SIMPLE,
  },
  {
    categoryType: NoteGroupCategoryType.SIMPLE_BEAMED_NOTES,
    type: NoteGroupType.SSSS,
    notes: [c(NoteType.S), c(NoteType.S), c(NoteType.S), c(NoteType.S)],
    beam: true,
    description: 'fourBeamed16thNotes',
    duration: 1,
    icon: require('../svg/notes/ssss.svg').default,
    defaultSelectionValue: true,
    index: 7,
    sortOrder: 13,
    timeSignatureComplexity: TimeSignatureComplexity.SIMPLE,
  },

  // Mixed beamed notes
  {
    categoryType: NoteGroupCategoryType.MIXED_BEAMED_NOTES,
    type: NoteGroupType.SSE,
    notes: [c(NoteType.S), c(NoteType.S), c(NoteType.E)],
    beam: true,
    description: 'two16thNotesAndAn8thNoteBeamed',
    duration: 1,
    icon: require('../svg/notes/sse.svg').default,
    defaultSelectionValue: false,
    index: 8,
    sortOrder: 14,
    timeSignatureComplexity: TimeSignatureComplexity.SIMPLE,
  },
  {
    categoryType: NoteGroupCategoryType.MIXED_BEAMED_NOTES,
    type: NoteGroupType.ESS,
    notes: [c(NoteType.E), c(NoteType.S), c(NoteType.S)],
    beam: true,
    description: 'an8thNoteAndTwo16thNotesBeamed',
    duration: 1,
    icon: require('../svg/notes/ess.svg').default,
    defaultSelectionValue: false,
    index: 9,
    sortOrder: 15,
    timeSignatureComplexity: TimeSignatureComplexity.SIMPLE,
  },
  {
    categoryType: NoteGroupCategoryType.MIXED_BEAMED_NOTES,
    type: NoteGroupType.SES,
    notes: [c(NoteType.S), c(NoteType.E), c(NoteType.S)],
    beam: true,
    description: 'an8thNoteA16thNoteAndAn8thNoteBeamed',
    duration: 1,
    icon: require('../svg/notes/ses.svg').default,
    defaultSelectionValue: false,
    index: 10,
    sortOrder: 16,
    timeSignatureComplexity: TimeSignatureComplexity.SIMPLE,
  },

  // Compound 8th note combinations
  {
    categoryType: NoteGroupCategoryType.COMPOUND_EIGHTH_NOTE_COMBINATIONS,
    type: NoteGroupType.CQE,
    notes: [c(NoteType.Q), c(NoteType.E)],
    beam: false,
    description: 'aQuarterNoteAndAn8thNote',
    duration: 1,
    icon: require('../svg/notes/cqe.svg').default,
    defaultSelectionValue: true,
    index: 31,
    sortOrder: 17,
    timeSignatureComplexity: TimeSignatureComplexity.COMPOUND,
  },
  {
    categoryType: NoteGroupCategoryType.COMPOUND_EIGHTH_NOTE_COMBINATIONS,
    type: NoteGroupType.CEQ,
    notes: [c(NoteType.E), c(NoteType.Q)],
    beam: false,
    description: 'an8thNoteAndAQuarterNote',
    duration: 1,
    icon: require('../svg/notes/ceq.svg').default,
    defaultSelectionValue: true,
    index: 32,
    sortOrder: 18,
    timeSignatureComplexity: TimeSignatureComplexity.COMPOUND,
  },
  {
    categoryType: NoteGroupCategoryType.COMPOUND_EIGHTH_NOTE_COMBINATIONS,
    type: NoteGroupType.CEEE,
    notes: [c(NoteType.E), c(NoteType.E), c(NoteType.E)],
    beam: true,
    description: 'three8thNotesBeamed',
    duration: 1,
    icon: require('../svg/notes/ceee.svg').default,
    defaultSelectionValue: true,
    index: 33,
    sortOrder: 19,
    timeSignatureComplexity: TimeSignatureComplexity.COMPOUND,
  },
  {
    categoryType: NoteGroupCategoryType.COMPOUND_EIGHTH_NOTE_COMBINATIONS,
    type: NoteGroupType.CTEE,
    notes: [c(NoteType.E), c(NoteType.E)],
    beam: true,
    tuplet: true,
    description: 'an8thNoteTuplet',
    duration: 1,
    icon: require('../svg/notes/ctee.svg').default,
    defaultSelectionValue: true,
    index: 34,
    sortOrder: 20,
    timeSignatureComplexity: TimeSignatureComplexity.COMPOUND,
  },

  // Tuplets
  {
    categoryType: NoteGroupCategoryType.TUPLETS,
    type: NoteGroupType.TQQQ,
    notes: [c(NoteType.Q), c(NoteType.Q), c(NoteType.Q)],
    tuplet: true,
    description: 'aQuarterNoteTriplet',
    duration: 2,
    icon: require('../svg/notes/tqqq.svg').default,
    defaultSelectionValue: false,
    index: 11,
    sortOrder: 21,
    timeSignatureComplexity: TimeSignatureComplexity.SIMPLE,
  },
  {
    categoryType: NoteGroupCategoryType.TUPLETS,
    type: NoteGroupType.TEEE,
    notes: [c(NoteType.E), c(NoteType.E), c(NoteType.E)],
    tuplet: true,
    beam: true,
    description: 'an8thNoteTriplet',
    duration: 1,
    icon: require('../svg/notes/teee.svg').default,
    defaultSelectionValue: false,
    index: 12,
    sortOrder: 22,
    timeSignatureComplexity: TimeSignatureComplexity.SIMPLE,
  },

  // Dotted note combinations
  {
    categoryType: NoteGroupCategoryType.DOTTED_NOTE_COMBINATIONS,
    type: NoteGroupType.WD,
    notes: [c(NoteType.W, false, true)],
    description: 'aDottedWholeNote',
    duration: 6,
    icon: require('../svg/notes/wd.svg').default,
    defaultSelectionValue: false,
    index: 41,
    sortOrder: 23,
    timeSignatureComplexity: TimeSignatureComplexity.SIMPLE,
  },
  {
    categoryType: NoteGroupCategoryType.DOTTED_NOTE_COMBINATIONS,
    type: NoteGroupType.HD,
    notes: [c(NoteType.H, false, true)],
    description: 'aDottedHalfNote',
    duration: 3,
    icon: require('../svg/notes/hd.svg').default,
    defaultSelectionValue: false,
    index: 13,
    sortOrder: 24,
    timeSignatureComplexity: TimeSignatureComplexity.SIMPLE,
  },
  {
    categoryType: NoteGroupCategoryType.DOTTED_NOTE_COMBINATIONS,
    type: NoteGroupType.QDE,
    notes: [c(NoteType.Q, false, true), c(NoteType.E)],
    description: 'aDottedQuarterNoteAndAn8thNote',
    duration: 2,
    icon: require('../svg/notes/qde.svg').default,
    defaultSelectionValue: false,
    index: 14,
    sortOrder: 25,
    timeSignatureComplexity: TimeSignatureComplexity.SIMPLE,
  },
  {
    categoryType: NoteGroupCategoryType.DOTTED_NOTE_COMBINATIONS,
    type: NoteGroupType.EQD,
    notes: [c(NoteType.E), c(NoteType.Q, false, true)],
    description: 'an8thNoteAndADottedQuarterNote',
    duration: 2,
    icon: require('../svg/notes/eqd.svg').default,
    defaultSelectionValue: false,
    index: 15,
    sortOrder: 26,
    timeSignatureComplexity: TimeSignatureComplexity.SIMPLE,
  },
  {
    categoryType: NoteGroupCategoryType.DOTTED_NOTE_COMBINATIONS,
    type: NoteGroupType.EDS,
    notes: [c(NoteType.E, false, true), c(NoteType.S)],
    beam: true,
    description: 'aDotted8thNoteAndA16thNoteBeamed',
    duration: 1,
    icon: require('../svg/notes/eds.svg').default,
    defaultSelectionValue: false,
    index: 16,
    sortOrder: 27,
    timeSignatureComplexity: TimeSignatureComplexity.SIMPLE,
  },
  {
    categoryType: NoteGroupCategoryType.DOTTED_NOTE_COMBINATIONS,
    type: NoteGroupType.SED,
    notes: [c(NoteType.S), c(NoteType.E, false, true)],
    beam: true,
    description: 'a16thNoteAndADotted8thNoteBeamed',
    duration: 1,
    icon: require('../svg/notes/sed.svg').default,
    defaultSelectionValue: false,
    index: 17,
    sortOrder: 28,
    timeSignatureComplexity: TimeSignatureComplexity.SIMPLE,
  },

  // Combinations with 8th rests
  {
    categoryType: NoteGroupCategoryType.EIGHTH_REST_COMBINATIONS,
    type: NoteGroupType.EER,
    notes: [c(NoteType.E), c(NoteType.E, true)],
    description: 'an8thNoteAndAn8thRest',
    duration: 1,
    icon: require('../svg/notes/eer.svg').default,
    defaultSelectionValue: false,
    index: 18,
    sortOrder: 29,
    timeSignatureComplexity: TimeSignatureComplexity.SIMPLE,
  },
  {
    categoryType: NoteGroupCategoryType.EIGHTH_REST_COMBINATIONS,
    type: NoteGroupType.ERE,
    notes: [c(NoteType.E, true), c(NoteType.E)],
    description: 'an8thRestAndAn8thNote',
    duration: 1,
    icon: require('../svg/notes/ere.svg').default,
    defaultSelectionValue: false,
    index: 19,
    sortOrder: 30,
    timeSignatureComplexity: TimeSignatureComplexity.SIMPLE,
  },
  {
    categoryType: NoteGroupCategoryType.EIGHTH_REST_COMBINATIONS,
    type: NoteGroupType.SSER,
    notes: [c(NoteType.S), c(NoteType.S), c(NoteType.E, true)],
    beam: true,
    description: 'twoBeamed16thNotesAndAn8thRest',
    duration: 1,
    icon: require('../svg/notes/sser.svg').default,
    defaultSelectionValue: false,
    index: 20,
    sortOrder: 31,
    timeSignatureComplexity: TimeSignatureComplexity.SIMPLE,
  },
  {
    categoryType: NoteGroupCategoryType.EIGHTH_REST_COMBINATIONS,
    type: NoteGroupType.ERSS,
    notes: [c(NoteType.E, true), c(NoteType.S), c(NoteType.S)],
    beam: true,
    description: 'an8thRestAndTwoBeamed16thNotes',
    duration: 1,
    icon: require('../svg/notes/erss.svg').default,
    defaultSelectionValue: false,
    index: 21,
    sortOrder: 32,
    timeSignatureComplexity: TimeSignatureComplexity.SIMPLE,
  },

  // Syncopated combinations
  {
    categoryType: NoteGroupCategoryType.SYNCOPATED_COMBINATIONS,
    type: NoteGroupType.EQE,
    notes: [c(NoteType.E), c(NoteType.Q), c(NoteType.E)],
    description: 'an8thNoteAQuarterNoteAndAn8thNote',
    duration: 2,
    icon: require('../svg/notes/eqe.svg').default,
    defaultSelectionValue: false,
    index: 22,
    sortOrder: 33,
    timeSignatureComplexity: TimeSignatureComplexity.SIMPLE,
  },
  {
    categoryType: NoteGroupCategoryType.SYNCOPATED_COMBINATIONS,
    type: NoteGroupType.EQQE,
    notes: [c(NoteType.E), c(NoteType.Q), c(NoteType.Q), c(NoteType.E)],
    description: 'an8thNoteTwoQuarterNotesAndAn8thNote',
    duration: 3,
    icon: require('../svg/notes/eqqe.svg').default,
    defaultSelectionValue: false,
    index: 23,
    sortOrder: 34,
    timeSignatureComplexity: TimeSignatureComplexity.SIMPLE,
  },
  {
    categoryType: NoteGroupCategoryType.SYNCOPATED_COMBINATIONS,
    type: NoteGroupType.EQQQE,
    notes: [
      c(NoteType.E),
      c(NoteType.Q),
      c(NoteType.Q),
      c(NoteType.Q),
      c(NoteType.E),
    ],
    description: 'an8thNoteThreeQuarterNotesAndAn8thNote',
    duration: 4,
    icon: require('../svg/notes/eqqqe.svg').default,
    defaultSelectionValue: false,
    index: 24,
    sortOrder: 35,
    timeSignatureComplexity: TimeSignatureComplexity.SIMPLE,
  },
  {
    categoryType: NoteGroupCategoryType.COMPOUND_COMPLEX_COMBINATIONS,
    type: NoteGroupType.CXQQREER,
    noteTemplate: [
      { duration: 2, notes: [c(NoteType.Q)] },
      { duration: 2, notes: [c(NoteType.Q, true)] },
      { duration: 1, notes: [c(NoteType.E)] },
      { duration: 1, notes: [c(NoteType.E, true)] },
    ],
    subGroupTargetDuration: 3,
    includePredicate: (subGroupsSoFar) => {
      // Exclude three 8th notes/rests. This will detect if we are about to build a group of
      // three 8th notes/rests and discard.
      if (
        subGroupsSoFar.length === 2 &&
        allOfType(subGroupsSoFar, NoteType.E)
      ) {
        return false;
      }

      // Discard all notes
      if (subGroupsSoFar.length === 2 && allNotes(subGroupsSoFar)) {
        return false;
      }

      // Discard all rests
      if (subGroupsSoFar.length === 2 && allRests(subGroupsSoFar)) {
        return false;
      }

      return true;
    },
    description: 'combinationsOfQuarterNotesQuarterRests8thNotesAnd8thRests',
    duration: 1,
    icon: require('../svg/notes/cxqqreer.svg').default,
    defaultSelectionValue: false,
    index: 35,
    sortOrder: 36,
    timeSignatureComplexity: TimeSignatureComplexity.COMPOUND,
  },
  {
    categoryType: NoteGroupCategoryType.COMPOUND_COMPLEX_COMBINATIONS,
    type: NoteGroupType.CXEER,
    noteTemplate: [
      { duration: 1, notes: [c(NoteType.E)] },
      { duration: 1, notes: [c(NoteType.E, true)] },
    ],
    subGroupTargetDuration: 3,
    includePredicate: (subGroupsSoFar) => {
      // Exclude patterns starting with two 8th rests
      if (subGroupsSoFar.length === 2 && allRests(subGroupsSoFar)) {
        return false;
      }

      // Exclude patterns ending with two 8th rests
      if (subGroupsSoFar.length === 3 && allRests(subGroupsSoFar.slice(1))) {
        return false;
      }

      if (subGroupsSoFar.length === 3 && allRests(subGroupsSoFar)) {
        // Exclude all rests
        return false;
      }

      // Exclude all notes
      if (subGroupsSoFar.length === 3 && allNotes(subGroupsSoFar)) {
        return false;
      }

      return true;
    },
    description: 'combinationsOf8thNotesAnd8thRests',
    duration: 1,
    icon: require('../svg/notes/cxeer.svg').default,
    defaultSelectionValue: false,
    index: 36,
    sortOrder: 37,
    timeSignatureComplexity: TimeSignatureComplexity.COMPOUND,
    beam: (notes) => {
      // Don't apply beam if first and third notes are rests
      if (notes[0].rest && notes[2].rest) {
        return false;
      }

      // Don't include the rest in the beam with two adjacent 8th notes
      if (notes[0].rest && !notes[1].rest && !notes[2].rest) {
        return '1-2';
      }

      if (!notes[0].rest && !notes[1].rest && notes[2].rest) {
        return '0-1';
      }

      return true;
    },
  },
  {
    categoryType: NoteGroupCategoryType.COMPOUND_COMPLEX_COMBINATIONS,
    type: NoteGroupType.CXESS,
    noteTemplate: [
      { duration: 1, notes: [c(NoteType.E)] },
      { duration: 1, notes: [c(NoteType.S), c(NoteType.S)] },
    ],
    subGroupTargetDuration: 3,
    includePredicate: (subGroupsSoFar) => {
      // Exclude patterns with all 8th notes
      if (
        subGroupsSoFar.length === 3 &&
        allOfType(subGroupsSoFar, NoteType.E)
      ) {
        return false;
      }

      return true;
    },
    description: 'combinationsOf8thNotesAnd16thNotes',
    duration: 1,
    icon: require('../svg/notes/cxess.svg').default,
    defaultSelectionValue: false,
    index: 37,
    sortOrder: 38,
    timeSignatureComplexity: TimeSignatureComplexity.COMPOUND,
    beam: true,
  },
  {
    categoryType: NoteGroupCategoryType.COMPOUND_COMPLEX_COMBINATIONS,
    type: NoteGroupType.CXQQRSS,
    noteTemplate: [
      { duration: 2, notes: [c(NoteType.Q)] },
      { duration: 2, notes: [c(NoteType.Q, true)] },
      { duration: 1, notes: [c(NoteType.S), c(NoteType.S)] },
    ],
    subGroupTargetDuration: 3,
    includePredicate: (subGroupsSoFar) => {
      // Exclude patterns with all 16th notes. If we have all 16th notes after the second subgroup,
      // we will end up having all 16h notes, so discard this selection
      if (
        subGroupsSoFar.length === 2 &&
        allOfType(subGroupsSoFar, NoteType.S)
      ) {
        return false;
      }

      return true;
    },
    description: 'combinationsOfQuarterNotesQuarterRestsAnd16thNotes',
    duration: 1,
    icon: require('../svg/notes/cxqqrss.svg').default,
    defaultSelectionValue: false,
    index: 38,
    sortOrder: 39,
    timeSignatureComplexity: TimeSignatureComplexity.COMPOUND,
    beam: (notes) => {
      if (notes[0].type === NoteType.Q) {
        return '1-2';
      }

      return '0-1';
    },
  },
  {
    categoryType: NoteGroupCategoryType.COMPOUND_COMPLEX_COMBINATIONS,
    type: NoteGroupType.CXEERSS,
    noteTemplate: [
      { duration: 1, notes: [c(NoteType.E)] },
      { duration: 1, notes: [c(NoteType.E, true)] },
      { duration: 1, notes: [c(NoteType.S), c(NoteType.S)] },
    ],
    subGroupTargetDuration: 3,
    includePredicate: (subGroupsSoFar) => {
      // Will want to exclude any patterns already represented by other patterns, this includes:
      // - patterns with just 8th and/or 16th notes without rests
      // - two 8th rest + 16th note patterns (represented by quarter rest + 2 16th notes)

      if (subGroupsSoFar.length === 2) {
        // If we have two 8th notes/rests, any more would cause an excluded pattern
        if (allOfType(subGroupsSoFar, NoteType.E)) {
          return false;
        }

        if (allRests(subGroupsSoFar)) {
          return false;
        }
      }

      if (subGroupsSoFar.length === 3) {
        // Exclude all 8th notes/rest only patterns
        if (allOfType(subGroupsSoFar, NoteType.E)) {
          return false;
        }

        // Exclude patterns that are just notes
        if (allNotes(subGroupsSoFar)) {
          return false;
        }

        // Exclude two rests at the end
        if (allRests(subGroupsSoFar.slice(1))) {
          return false;
        }
      }

      return true;
    },
    description: 'combinations8thNotes8thRestsAndTwo16thNotes',
    duration: 1,
    icon: require('../svg/notes/cxeerss.svg').default,
    defaultSelectionValue: false,
    index: 39,
    sortOrder: 40,
    timeSignatureComplexity: TimeSignatureComplexity.COMPOUND,
    beam: (notes) => {
      const notesLength = notes.length;
      const firstNote = notes[0];
      const lastNote = notes[notesLength - 1];

      if (!firstNote.rest && !lastNote.rest) {
        return true;
      }

      if (firstNote.rest && lastNote.rest) {
        return '1-2';
      }

      if (firstNote.rest && !lastNote.rest) {
        return `1-${notesLength - 1}`;
      }

      return `0-${notesLength - 2}`;
    },
  },
  {
    categoryType: NoteGroupCategoryType.COMPOUND_COMPLEX_COMBINATIONS,
    type: NoteGroupType.CXEERSSR,
    noteTemplate: [
      { duration: 1, notes: [c(NoteType.E)] },
      { duration: 1, notes: [c(NoteType.E, true)] },
      { duration: 1, notes: [c(NoteType.S), c(NoteType.S)] },
      { duration: 1, notes: [c(NoteType.S), c(NoteType.S, true)] },
      { duration: 1, notes: [c(NoteType.S, true), c(NoteType.S)] },
    ],
    subGroupTargetDuration: 3,
    includePredicate: (subGroupsSoFar) => {
      // Only include patterns that have a 16th rest, as all other combinations are covered by
      // other note groups
      if (
        subGroupsSoFar.length === 3 &&
        !anyOfType(subGroupsSoFar, NoteType.S, true)
      ) {
        return false;
      }

      return true;
    },
    description: 'combinations8thNotes8thRests16thNotesAnd16thRests',
    duration: 1,
    icon: require('../svg/notes/cxeerssr.svg').default,
    defaultSelectionValue: false,
    index: 40,
    sortOrder: 41,
    timeSignatureComplexity: TimeSignatureComplexity.COMPOUND,
    beam: true,
  },
];
