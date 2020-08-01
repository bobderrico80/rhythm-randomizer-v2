import { TypedItem, findItemOfType } from './util';

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
}

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

// Alias to make defining note groups less verbose
const c = createNote;

const noteGroups: NoteGroup[] = [
  // Basic notes
  {
    type: NoteGroupType.W,
    notes: [c(NoteType.W)],
    description: 'whole note',
    duration: 4,
  },
  {
    type: NoteGroupType.H,
    notes: [c(NoteType.H)],
    description: 'half note',
    duration: 2,
  },
  {
    type: NoteGroupType.Q,
    notes: [c(NoteType.Q)],
    description: 'quarter note',
    duration: 1,
  },

  // Basic rests
  {
    type: NoteGroupType.WR,
    notes: [c(NoteType.WR)],
    description: 'a whole rest',
    duration: 4,
  },
  {
    type: NoteGroupType.HR,
    notes: [c(NoteType.HR)],
    description: 'a half rest',
    duration: 2,
  },
  {
    type: NoteGroupType.QR,
    notes: [c(NoteType.QR)],
    description: 'a quarter rest',
    duration: 1,
  },

  // Simple beamed notes
  {
    type: NoteGroupType.EE,
    notes: [c(NoteType.E), c(NoteType.E)],
    beam: true,
    description: 'two beamed 8th notes',
    duration: 1,
  },
  {
    type: NoteGroupType.SSSS,
    notes: [c(NoteType.S), c(NoteType.S), c(NoteType.S), c(NoteType.S)],
    beam: true,
    description: 'four beamed 16th notes',
    duration: 1,
  },

  // Mixed beamed notes
  {
    type: NoteGroupType.SSE,
    notes: [c(NoteType.S), c(NoteType.S), c(NoteType.E)],
    beam: true,
    description: 'two 16th notes and an 8th note, beamed',
    duration: 1,
  },
  {
    type: NoteGroupType.ESS,
    notes: [c(NoteType.E), c(NoteType.S), c(NoteType.S)],
    beam: true,
    description: 'an 8th note and two 16th notes, beamed',
    duration: 1,
  },
  {
    type: NoteGroupType.SES,
    notes: [c(NoteType.S), c(NoteType.E), c(NoteType.S)],
    beam: true,
    description: 'an 8th note, a 16th notes, and an 8th note, beamed',
    duration: 1,
  },

  // Tuplets
  {
    type: NoteGroupType.TQQQ,
    notes: [c(NoteType.Q), c(NoteType.Q), c(NoteType.Q)],
    tuplet: true,
    description: 'a quarter note triplet',
    duration: 2,
  },
  {
    type: NoteGroupType.TEEE,
    notes: [c(NoteType.E), c(NoteType.E), c(NoteType.E)],
    tuplet: true,
    beam: true,
    description: 'an 8th note triplet',
    duration: 1,
  },

  // Dotted note combinations
  {
    type: NoteGroupType.HD,
    notes: [c(NoteType.H, true)],
    description: 'a dotted half note',
    duration: 3,
  },
  {
    type: NoteGroupType.QDE,
    notes: [c(NoteType.Q, true), c(NoteType.E)],
    description: 'a dotted quarter note and an 8th note',
    duration: 2,
  },
  {
    type: NoteGroupType.EQD,
    notes: [c(NoteType.E), c(NoteType.Q, true)],
    description: 'an 8th note and a dotted quarter note',
    duration: 2,
  },
  {
    type: NoteGroupType.EDS,
    notes: [c(NoteType.E, true), c(NoteType.S)],
    beam: true,
    description: 'a dotted 8th note and a 16th note, beamed',
    duration: 1,
  },
  {
    type: NoteGroupType.SED,
    notes: [c(NoteType.S), c(NoteType.E, true)],
    beam: true,
    description: 'a 16th note and a dotted 8th note, beamed',
    duration: 1,
  },

  // Combinations with 8th rests
  {
    type: NoteGroupType.EER,
    notes: [c(NoteType.E), c(NoteType.ER)],
    description: 'an 8th note and an 8th rest',
    duration: 1,
  },
  {
    type: NoteGroupType.ERE,
    notes: [c(NoteType.ER), c(NoteType.E)],
    description: 'an 8th rest and an 8th note',
    duration: 1,
  },
  {
    type: NoteGroupType.SSER,
    notes: [c(NoteType.S), c(NoteType.S), c(NoteType.ER)],
    beam: true,
    description: 'two beamed 16th notes and an 8th rest',
    duration: 1,
  },
  {
    type: NoteGroupType.ERSS,
    notes: [c(NoteType.ER), c(NoteType.S), c(NoteType.S)],
    beam: true,
    description: 'an 8th rest and two beamed 16th notes',
    duration: 1,
  },

  // Syncopated combinations
  {
    type: NoteGroupType.EQE,
    notes: [c(NoteType.E), c(NoteType.Q), c(NoteType.E)],
    description: 'an 8th note, a quarter note, and an 8th note',
    duration: 2,
  },
  {
    type: NoteGroupType.EQQE,
    notes: [c(NoteType.E), c(NoteType.Q), c(NoteType.Q), c(NoteType.E)],
    description: 'an 8th note, two quarter notes, and an 8th note',
    duration: 3,
  },
  {
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
  },
];

export const getNoteGroup = (type: NoteGroupType): NoteGroup => {
  return findItemOfType<NoteGroupType, NoteGroup>(type, noteGroups);
};

export const getNoteGroups = (...types: NoteGroupType[]): NoteGroup[] => {
  return types.map(getNoteGroup);
};

export const getTotalDuration = (noteGroups: NoteGroup[]): number => {
  return noteGroups.reduce((sum, noteGroup) => {
    return sum + noteGroup.duration;
  }, 0);
};
