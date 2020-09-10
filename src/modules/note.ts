import { sortBy } from 'lodash';
import { Map } from 'immutable';
import { TypedItem, findItemOfType } from './util';

export enum NoteGroupCategoryType {
  BASIC_NOTES = 'Basic Notes',
  BASIC_RESTS = 'Basic Rests',
  SIMPLE_BEAMED_NOTES = 'Simple Beamed Notes',
  MIXED_BEAMED_NOTES = 'Mixed Beamed Notes',
  TUPLETS = 'Tuplets',
  DOTTED_NOTE_COMBINATIONS = 'Dotted Note Combinations',
  EIGHTH_REST_COMBINATIONS = '8th Rest Combinations',
  SYNCOPATED_COMBINATIONS = 'Syncopated Combinations',
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
}

export enum NoteType {
  // W = whole, H = half, Q = quarter, E = 8th, S = 16th, add R for the rest
  W = 'w',
  H = 'h',
  Q = 'q',
  E = '8',
  S = '16',
  WR = 'wr',
  HR = 'hr',
  QR = 'qr',
  ER = '8r',
}

export interface Note {
  type: string;
  widthUnit: number;
  dotted?: boolean;
}

export interface NoteGroup extends TypedItem<NoteGroupType> {
  type: NoteGroupType;
  notes: Note[];
  beam?: boolean;
  tuplet?: boolean;
  description: string;
  duration: number;
  icon: string;
  categoryType: NoteGroupCategoryType;
  defaultSelectionValue: boolean;
  sortOrder: number;
}

export interface CategorizedNoteGroup {
  category: NoteGroupCategory;
  noteGroups: NoteGroup[];
}

export interface NoteGroupCategory {
  type: NoteGroupCategoryType;
  sortOrder: number;
}

export type NoteGroupTypeSelectionMap = Map<NoteGroupType, Boolean>;

const noteWidthUnitMap = {
  [NoteType.W]: 13,
  [NoteType.H]: 8,
  [NoteType.Q]: 5,
  [NoteType.E]: 3,
  [NoteType.S]: 1,
  [NoteType.WR]: 13,
  [NoteType.HR]: 8,
  [NoteType.QR]: 5,
  [NoteType.ER]: 3,
};

const createNote = (type: NoteType, dotted: boolean = false): Note => {
  let widthUnit = noteWidthUnitMap[type];

  if (dotted) {
    widthUnit *= 1.5;
  }

  return {
    type,
    dotted,
    widthUnit,
  };
};

export const noteGroupCategories: NoteGroupCategory[] = [
  {
    type: NoteGroupCategoryType.BASIC_NOTES,
    sortOrder: 0,
  },
  {
    type: NoteGroupCategoryType.BASIC_RESTS,
    sortOrder: 1,
  },
  {
    type: NoteGroupCategoryType.SIMPLE_BEAMED_NOTES,
    sortOrder: 2,
  },
  {
    type: NoteGroupCategoryType.MIXED_BEAMED_NOTES,
    sortOrder: 3,
  },
  {
    type: NoteGroupCategoryType.TUPLETS,
    sortOrder: 4,
  },
  {
    type: NoteGroupCategoryType.DOTTED_NOTE_COMBINATIONS,
    sortOrder: 5,
  },
  {
    type: NoteGroupCategoryType.EIGHTH_REST_COMBINATIONS,
    sortOrder: 6,
  },
  {
    type: NoteGroupCategoryType.SYNCOPATED_COMBINATIONS,
    sortOrder: 7,
  },
];

// Alias to make defining note groups less verbose
const c = createNote;

export const noteGroups: NoteGroup[] = [
  // Basic notes
  {
    categoryType: NoteGroupCategoryType.BASIC_NOTES,
    type: NoteGroupType.W,
    notes: [c(NoteType.W)],
    description: 'a whole note',
    duration: 4,
    icon: require('../svg/notes/w.svg'),
    defaultSelectionValue: true,
    sortOrder: 0,
  },
  {
    categoryType: NoteGroupCategoryType.BASIC_NOTES,
    type: NoteGroupType.H,
    notes: [c(NoteType.H)],
    description: 'a half note',
    duration: 2,
    icon: require('../svg/notes/h.svg'),
    defaultSelectionValue: true,
    sortOrder: 1,
  },
  {
    categoryType: NoteGroupCategoryType.BASIC_NOTES,
    type: NoteGroupType.Q,
    notes: [c(NoteType.Q)],
    description: 'a quarter note',
    duration: 1,
    icon: require('../svg/notes/q.svg'),
    defaultSelectionValue: true,
    sortOrder: 2,
  },

  // Basic rests
  {
    categoryType: NoteGroupCategoryType.BASIC_RESTS,
    type: NoteGroupType.WR,
    notes: [c(NoteType.WR)],
    description: 'a whole rest',
    duration: 4,
    icon: require('../svg/notes/wr.svg'),
    defaultSelectionValue: true,
    sortOrder: 3,
  },
  {
    categoryType: NoteGroupCategoryType.BASIC_RESTS,
    type: NoteGroupType.HR,
    notes: [c(NoteType.HR)],
    description: 'a half rest',
    duration: 2,
    icon: require('../svg/notes/hr.svg'),
    defaultSelectionValue: true,
    sortOrder: 4,
  },
  {
    categoryType: NoteGroupCategoryType.BASIC_RESTS,
    type: NoteGroupType.QR,
    notes: [c(NoteType.QR)],
    description: 'a quarter rest',
    duration: 1,
    icon: require('../svg/notes/qr.svg'),
    defaultSelectionValue: true,
    sortOrder: 5,
  },

  // Simple beamed notes
  {
    categoryType: NoteGroupCategoryType.SIMPLE_BEAMED_NOTES,
    type: NoteGroupType.EE,
    notes: [c(NoteType.E), c(NoteType.E)],
    beam: true,
    description: 'two beamed 8th notes',
    duration: 1,
    icon: require('../svg/notes/ee.svg'),
    defaultSelectionValue: true,
    sortOrder: 6,
  },
  {
    categoryType: NoteGroupCategoryType.SIMPLE_BEAMED_NOTES,
    type: NoteGroupType.SSSS,
    notes: [c(NoteType.S), c(NoteType.S), c(NoteType.S), c(NoteType.S)],
    beam: true,
    description: 'four beamed 16th notes',
    duration: 1,
    icon: require('../svg/notes/ssss.svg'),
    defaultSelectionValue: true,
    sortOrder: 7,
  },

  // Mixed beamed notes
  {
    categoryType: NoteGroupCategoryType.MIXED_BEAMED_NOTES,
    type: NoteGroupType.SSE,
    notes: [c(NoteType.S), c(NoteType.S), c(NoteType.E)],
    beam: true,
    description: 'two 16th notes and an 8th note, beamed',
    duration: 1,
    icon: require('../svg/notes/sse.svg'),
    defaultSelectionValue: false,
    sortOrder: 8,
  },
  {
    categoryType: NoteGroupCategoryType.MIXED_BEAMED_NOTES,
    type: NoteGroupType.ESS,
    notes: [c(NoteType.E), c(NoteType.S), c(NoteType.S)],
    beam: true,
    description: 'an 8th note and two 16th notes, beamed',
    duration: 1,
    icon: require('../svg/notes/ess.svg'),
    defaultSelectionValue: false,
    sortOrder: 9,
  },
  {
    categoryType: NoteGroupCategoryType.MIXED_BEAMED_NOTES,
    type: NoteGroupType.SES,
    notes: [c(NoteType.S), c(NoteType.E), c(NoteType.S)],
    beam: true,
    description: 'an 8th note, a 16th notes, and an 8th note, beamed',
    duration: 1,
    icon: require('../svg/notes/ses.svg'),
    defaultSelectionValue: false,
    sortOrder: 10,
  },

  // Tuplets
  {
    categoryType: NoteGroupCategoryType.TUPLETS,
    type: NoteGroupType.TQQQ,
    notes: [c(NoteType.Q), c(NoteType.Q), c(NoteType.Q)],
    tuplet: true,
    description: 'a quarter note triplet',
    duration: 2,
    icon: require('../svg/notes/tqqq.svg'),
    defaultSelectionValue: false,
    sortOrder: 11,
  },
  {
    categoryType: NoteGroupCategoryType.TUPLETS,
    type: NoteGroupType.TEEE,
    notes: [c(NoteType.E), c(NoteType.E), c(NoteType.E)],
    tuplet: true,
    beam: true,
    description: 'an 8th note triplet',
    duration: 1,
    icon: require('../svg/notes/teee.svg'),
    defaultSelectionValue: false,
    sortOrder: 12,
  },

  // Dotted note combinations
  {
    categoryType: NoteGroupCategoryType.DOTTED_NOTE_COMBINATIONS,
    type: NoteGroupType.HD,
    notes: [c(NoteType.H, true)],
    description: 'a dotted half note',
    duration: 3,
    icon: require('../svg/notes/hd.svg'),
    defaultSelectionValue: false,
    sortOrder: 13,
  },
  {
    categoryType: NoteGroupCategoryType.DOTTED_NOTE_COMBINATIONS,
    type: NoteGroupType.QDE,
    notes: [c(NoteType.Q, true), c(NoteType.E)],
    description: 'a dotted quarter note and an 8th note',
    duration: 2,
    icon: require('../svg/notes/qde.svg'),
    defaultSelectionValue: false,
    sortOrder: 14,
  },
  {
    categoryType: NoteGroupCategoryType.DOTTED_NOTE_COMBINATIONS,
    type: NoteGroupType.EQD,
    notes: [c(NoteType.E), c(NoteType.Q, true)],
    description: 'an 8th note and a dotted quarter note',
    duration: 2,
    icon: require('../svg/notes/eqd.svg'),
    defaultSelectionValue: false,
    sortOrder: 15,
  },
  {
    categoryType: NoteGroupCategoryType.DOTTED_NOTE_COMBINATIONS,
    type: NoteGroupType.EDS,
    notes: [c(NoteType.E, true), c(NoteType.S)],
    beam: true,
    description: 'a dotted 8th note and a 16th note, beamed',
    duration: 1,
    icon: require('../svg/notes/eds.svg'),
    defaultSelectionValue: false,
    sortOrder: 16,
  },
  {
    categoryType: NoteGroupCategoryType.DOTTED_NOTE_COMBINATIONS,
    type: NoteGroupType.SED,
    notes: [c(NoteType.S), c(NoteType.E, true)],
    beam: true,
    description: 'a 16th note and a dotted 8th note, beamed',
    duration: 1,
    icon: require('../svg/notes/sed.svg'),
    defaultSelectionValue: false,
    sortOrder: 17,
  },

  // Combinations with 8th rests
  {
    categoryType: NoteGroupCategoryType.EIGHTH_REST_COMBINATIONS,
    type: NoteGroupType.EER,
    notes: [c(NoteType.E), c(NoteType.ER)],
    description: 'an 8th note and an 8th rest',
    duration: 1,
    icon: require('../svg/notes/eer.svg'),
    defaultSelectionValue: false,
    sortOrder: 18,
  },
  {
    categoryType: NoteGroupCategoryType.EIGHTH_REST_COMBINATIONS,
    type: NoteGroupType.ERE,
    notes: [c(NoteType.ER), c(NoteType.E)],
    description: 'an 8th rest and an 8th note',
    duration: 1,
    icon: require('../svg/notes/ere.svg'),
    defaultSelectionValue: false,
    sortOrder: 19,
  },
  {
    categoryType: NoteGroupCategoryType.EIGHTH_REST_COMBINATIONS,
    type: NoteGroupType.SSER,
    notes: [c(NoteType.S), c(NoteType.S), c(NoteType.ER)],
    beam: true,
    description: 'two beamed 16th notes and an 8th rest',
    duration: 1,
    icon: require('../svg/notes/sser.svg'),
    defaultSelectionValue: false,
    sortOrder: 20,
  },
  {
    categoryType: NoteGroupCategoryType.EIGHTH_REST_COMBINATIONS,
    type: NoteGroupType.ERSS,
    notes: [c(NoteType.ER), c(NoteType.S), c(NoteType.S)],
    beam: true,
    description: 'an 8th rest and two beamed 16th notes',
    duration: 1,
    icon: require('../svg/notes/erss.svg'),
    defaultSelectionValue: false,
    sortOrder: 21,
  },

  // Syncopated combinations
  {
    categoryType: NoteGroupCategoryType.SYNCOPATED_COMBINATIONS,
    type: NoteGroupType.EQE,
    notes: [c(NoteType.E), c(NoteType.Q), c(NoteType.E)],
    description: 'an 8th note, a quarter note, and an 8th note',
    duration: 2,
    icon: require('../svg/notes/eqe.svg'),
    defaultSelectionValue: false,
    sortOrder: 22,
  },
  {
    categoryType: NoteGroupCategoryType.SYNCOPATED_COMBINATIONS,
    type: NoteGroupType.EQQE,
    notes: [c(NoteType.E), c(NoteType.Q), c(NoteType.Q), c(NoteType.E)],
    description: 'an 8th note, two quarter notes, and an 8th note',
    duration: 3,
    icon: require('../svg/notes/eqqe.svg'),
    defaultSelectionValue: false,
    sortOrder: 23,
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
    description: 'an 8th note, three quarter notes, and an 8th note',
    duration: 4,
    icon: require('../svg/notes/eqqqe.svg'),
    defaultSelectionValue: false,
    sortOrder: 24,
  },
];

export const categorizeNoteGroups = (
  noteGroups: NoteGroup[]
): CategorizedNoteGroup[] => {
  let categorizedNoteGroups = noteGroups.reduce(
    (
      previousCategorizedNoteGroups: CategorizedNoteGroup[],
      noteGroup: NoteGroup
    ) => {
      const existingCategorizedNoteGroup = previousCategorizedNoteGroups.find(
        (categorizedNoteGroup) =>
          categorizedNoteGroup.category.type === noteGroup.categoryType
      );

      if (existingCategorizedNoteGroup) {
        existingCategorizedNoteGroup.noteGroups.push(noteGroup);
      } else {
        previousCategorizedNoteGroups.push({
          category: getNoteGroupCategory(noteGroup.categoryType),
          noteGroups: [noteGroup],
        });
      }
      return previousCategorizedNoteGroups;
    },
    []
  );

  categorizedNoteGroups = sortBy<CategorizedNoteGroup>(
    categorizedNoteGroups,
    (categorizedNoteGroup) => {
      return categorizedNoteGroup.category.sortOrder;
    }
  );

  categorizedNoteGroups.forEach((categorizedNoteGroup) => {
    categorizedNoteGroup.noteGroups = sortBy<NoteGroup>(
      categorizedNoteGroup.noteGroups,
      ['sortOrder']
    );
  });

  return categorizedNoteGroups;
};

export const getNoteGroupTypeSelectionMap = (
  maxDuration: number
): NoteGroupTypeSelectionMap => {
  const noteGroupSelections = noteGroups.reduce((accumulator, noteGroup) => {
    if (noteGroup.duration <= maxDuration) {
      accumulator[noteGroup.type] = noteGroup.defaultSelectionValue;
    }
    return accumulator;
  }, {} as { [key: string]: boolean });
  return Map(noteGroupSelections) as NoteGroupTypeSelectionMap;
};

export const resetNoteGroupTypeSelectionMap = (
  noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap
) => {
  return noteGroupTypeSelectionMap.reduce(
    (previousNoteGroupTypeSelectionMap, _, noteGroupType) => {
      return previousNoteGroupTypeSelectionMap.set(noteGroupType, false);
    },
    noteGroupTypeSelectionMap
  );
};

export const getNoteGroup = (type: NoteGroupType): NoteGroup => {
  return findItemOfType<NoteGroupType, NoteGroup>(type, noteGroups);
};

export const getNoteGroupCategory = (
  type: NoteGroupCategoryType
): NoteGroupCategory => {
  return findItemOfType<NoteGroupCategoryType, NoteGroupCategory>(
    type,
    noteGroupCategories
  );
};

export const getNoteGroups = (...types: NoteGroupType[]): NoteGroup[] => {
  return types.map(getNoteGroup);
};

export const getTotalDuration = (noteGroups: NoteGroup[]): number => {
  return noteGroups.reduce((sum, noteGroup) => {
    return sum + noteGroup.duration;
  }, 0);
};

export const getSelectedNoteGroupTypes = (
  noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap
) => {
  return [...noteGroupTypeSelectionMap.entries()].reduce(
    (previousNoteGroupTypes, [noteGroupType, checked]) => {
      if (checked) {
        previousNoteGroupTypes.push(noteGroupType);
      }

      return previousNoteGroupTypes;
    },
    [] as NoteGroupType[]
  );
};
