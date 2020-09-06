import Vex from 'vexflow';
import { Measure, System } from './vex';
import { Note, NoteType, NoteGroup } from './note';
import { TimeSignature } from './time-signature';

export interface ScoreDimensions {
  width: number;
  height: number;
  scaleFactor: number;
}

export interface NoteConfiguration {
  clef: string;
  keys: string[];
  duration: string;
  stemDirection: number;
  autoStem: boolean;
  addDot: boolean;
  xShift?: number;
}

export interface MeasureConfiguration {
  xOffset: number;
  yOffset: number;
  measureWidth: number;
  staveLineConfig: boolean[];
  clef?: string;
  timeSignature?: string;
  beginningBarline: number;
  endBarline: number;
  firstMeasure: boolean;
}

export interface ScoreData {
  measures: Measure[];
  timeSignature: TimeSignature;
}

// All measurements below in px, unless otherwise specified
const SCORE_PADDING_LEFT = 10;
const SCORE_PADDING_RIGHT = 10;
const SCORE_PADDING_TOP = 40;
const SCORE_PADDING_BOTTOM = 40;

const MAX_SCORE_WIDTH = 1220;

const SYSTEM_VERTICAL_OFFSET = 150;
const DEFAULT_MEASURE_WIDTH = 300;
const MEASURES_PER_SYSTEM = 4;

const DEFAULT_CLEF = 'percussion';
const DEFAULT_PITCHES = ['b/4'];
const WHOLE_REST_CENTERING_OFFSET = 0.43; // percent
const WHOLE_REST_CENTERING_FIRST_MEASURE_ADDITIONAL_OFFSET = -0.1; // percent

export const getScoreDimensions = (
  totalMeasures: number,
  innerWidth: number
): ScoreDimensions => {
  let effectiveMeasuresPerSystem = MEASURES_PER_SYSTEM;

  if (totalMeasures < effectiveMeasuresPerSystem) {
    effectiveMeasuresPerSystem = totalMeasures;
  }

  let width = MAX_SCORE_WIDTH;

  const scoreWidth =
    SCORE_PADDING_LEFT +
    DEFAULT_MEASURE_WIDTH * effectiveMeasuresPerSystem +
    SCORE_PADDING_RIGHT;

  let scaleFactor = 1;

  if (scoreWidth < MAX_SCORE_WIDTH) {
    scaleFactor = MAX_SCORE_WIDTH / scoreWidth;
    width = MAX_SCORE_WIDTH;
  }

  if (innerWidth < width) {
    scaleFactor = innerWidth / scoreWidth;
    width = innerWidth;
  }

  const numberOfSystems = Math.ceil(totalMeasures / effectiveMeasuresPerSystem);

  const height =
    (SCORE_PADDING_TOP +
      SYSTEM_VERTICAL_OFFSET * numberOfSystems +
      SCORE_PADDING_BOTTOM) *
    scaleFactor;

  return {
    width,
    height,
    scaleFactor,
  };
};

const getCurrentSystemIndex = (measureIndex: number, totalMeasures: number) =>
  Math.floor(
    measureIndex / totalMeasures / (MEASURES_PER_SYSTEM / totalMeasures)
  );

export const splitMeasuresIntoSystems = (measures: Measure[]): System[] => {
  return measures.reduce((previousSystems, measure, index) => {
    const currentSystemIndex = getCurrentSystemIndex(index, measures.length);

    if (!previousSystems[currentSystemIndex]) {
      previousSystems[currentSystemIndex] = {
        measures: [],
      };
    }

    previousSystems[currentSystemIndex].measures.push(measure);

    return previousSystems;
  }, [] as System[]);
};

export const getNoteConfiguration = (
  note: Note,
  measureWidth: number,
  inFirstMeasure: boolean
): NoteConfiguration => {
  const noteConfiguration: NoteConfiguration = {
    clef: DEFAULT_CLEF,
    keys: DEFAULT_PITCHES,
    duration: note.type,
    stemDirection: Vex.Flow.Stem.UP,
    autoStem: false,
    addDot: note.dotted ? true : false,
  };

  // Center the whole rest
  if (note.type === NoteType.WR) {
    let offsetPercent = WHOLE_REST_CENTERING_OFFSET;

    if (inFirstMeasure) {
      offsetPercent += WHOLE_REST_CENTERING_FIRST_MEASURE_ADDITIONAL_OFFSET;
    }

    noteConfiguration.xShift = measureWidth * offsetPercent;
  }

  return noteConfiguration;
};

export const getMeasureConfiguration = (
  systemIndex: number,
  measureIndexInSystem: number,
  measureWidths: number[],
  finalMeasure: boolean,
  timeSignature: TimeSignature
): MeasureConfiguration => {
  let previousMeasureOffsets = 0;
  for (let i = 0; i < measureIndexInSystem; i++) {
    previousMeasureOffsets += measureWidths[i];
  }

  const xOffset = SCORE_PADDING_LEFT + previousMeasureOffsets;
  const yOffset = SCORE_PADDING_TOP + SYSTEM_VERTICAL_OFFSET * systemIndex;
  const measureWidth = measureWidths[measureIndexInSystem];
  const firstMeasure = measureIndexInSystem === 0 && systemIndex === 0;

  const measureConfiguration: MeasureConfiguration = {
    xOffset,
    yOffset,
    measureWidth,
    staveLineConfig: [false, false, true, false, false],
    beginningBarline:
      measureIndexInSystem === 0
        ? Vex.Flow.Barline.type.NONE
        : Vex.Flow.Barline.type.SINGLE,
    endBarline: finalMeasure
      ? Vex.Flow.Barline.type.END
      : Vex.Flow.Barline.type.SINGLE,
    firstMeasure,
  };

  if (firstMeasure) {
    measureConfiguration.timeSignature = timeSignature.type;
  }

  if (measureIndexInSystem === 0) {
    measureConfiguration.clef = DEFAULT_CLEF;
  }

  return measureConfiguration;
};

const getNoteGroupWidthUnits = (noteGroup: NoteGroup): number => {
  return noteGroup.notes.reduce((sum, noteGroup) => {
    return (sum += noteGroup.widthUnit);
  }, 0);
};

const getMeasureWidthUnits = (measure: Measure): number => {
  return measure.noteGroups.reduce((sum, noteGroup) => {
    return (sum += getNoteGroupWidthUnits(noteGroup));
  }, 0);
};

export const calculateMeasureWidths = (system: System) => {
  const measureWidthUnits = system.measures.map((measure) => {
    return getMeasureWidthUnits(measure);
  });

  const totalWidthUnits = measureWidthUnits.reduce(
    (sum, widthUnit) => (sum += widthUnit),
    0
  );

  const systemMeasureWidth = system.measures.length * DEFAULT_MEASURE_WIDTH;
  const widthUnitSize = systemMeasureWidth / totalWidthUnits;

  return measureWidthUnits.map((measureWidthUnit) => {
    return measureWidthUnit * widthUnitSize;
  });
};
