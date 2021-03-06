import Vex from 'vexflow';
import { Measure, System } from './vex';
import {
  Note,
  NoteType,
  GeneratedNoteGroup,
  noteWidthUnitMap,
} from './note-definition';
import { TimeSignature, TimeSignatureComplexity } from './time-signature';

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

export interface ScoreDimensionConfig {
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  paddingBottom: number;
  maxWidth: number;
  systemVerticalOffset: number;
  defaultMeasureWidth: number;
  wholeRestCenteringOffset: number;
  wholeRestCenteringFirstMeasureAdditionalOffset: number;
  dottedWholeRestCenteringAdditionalOffset: number;
}

const DEFAULT_CLEF = 'percussion';
const DEFAULT_PITCHES = ['b/4'];

export const getScoreDimensions = (
  totalMeasures: number,
  innerWidth: number,
  measuresPerSystem: number,
  scoreDimensionConfig: ScoreDimensionConfig
): ScoreDimensions => {
  const {
    paddingLeft,
    paddingRight,
    paddingTop,
    paddingBottom,
    maxWidth,
    systemVerticalOffset,
    defaultMeasureWidth,
  } = scoreDimensionConfig;

  let effectiveMeasuresPerSystem = measuresPerSystem;

  if (totalMeasures < effectiveMeasuresPerSystem) {
    effectiveMeasuresPerSystem = totalMeasures;
  }

  let width = scoreDimensionConfig.maxWidth;

  const scoreWidth =
    paddingLeft +
    defaultMeasureWidth * effectiveMeasuresPerSystem +
    paddingRight;

  let scaleFactor = 1;

  if (scoreWidth < maxWidth) {
    scaleFactor = maxWidth / scoreWidth;
    width = maxWidth;
  }

  if (innerWidth < width) {
    scaleFactor = innerWidth / scoreWidth;
    width = innerWidth;
  }

  const numberOfSystems = Math.ceil(totalMeasures / effectiveMeasuresPerSystem);

  const height =
    (paddingTop + systemVerticalOffset * numberOfSystems + paddingBottom) *
    scaleFactor;

  return {
    width,
    height,
    scaleFactor,
  };
};

const getCurrentSystemIndex = (
  measureIndex: number,
  totalMeasures: number,
  measuresPerSystem: number
) =>
  Math.floor(
    measureIndex / totalMeasures / (measuresPerSystem / totalMeasures)
  );

export const splitMeasuresIntoSystems = (
  measures: Measure[],
  measuresPerSystem: number
): System[] => {
  return measures.reduce((previousSystems, measure, index) => {
    const currentSystemIndex = getCurrentSystemIndex(
      index,
      measures.length,
      measuresPerSystem
    );

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
  inFirstMeasure: boolean,
  scoreDimensionConfig: ScoreDimensionConfig
): NoteConfiguration => {
  const noteConfiguration: NoteConfiguration = {
    clef: DEFAULT_CLEF,
    keys: DEFAULT_PITCHES,
    duration: note.type,
    stemDirection: Vex.Flow.Stem.UP,
    autoStem: false,
    addDot: note.dotted ? true : false,
  };

  // Center the whole rest and remove the dot, even if it has one (as in compound time signatures)
  if (note.type === NoteType.W && note.rest) {
    noteConfiguration.addDot = false;

    let offsetPercent = scoreDimensionConfig.wholeRestCenteringOffset;

    if (inFirstMeasure) {
      offsetPercent +=
        scoreDimensionConfig.wholeRestCenteringFirstMeasureAdditionalOffset;
    }

    if (note.dotted) {
      offsetPercent +=
        scoreDimensionConfig.dottedWholeRestCenteringAdditionalOffset;
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
  timeSignature: TimeSignature,
  scoreDimensionConfig: ScoreDimensionConfig
): MeasureConfiguration => {
  let previousMeasureOffsets = 0;
  for (let i = 0; i < measureIndexInSystem; i++) {
    previousMeasureOffsets += measureWidths[i];
  }

  const {
    paddingTop,
    paddingLeft,
    systemVerticalOffset,
  } = scoreDimensionConfig;

  const xOffset = paddingLeft + previousMeasureOffsets;
  const yOffset = paddingTop + systemVerticalOffset * systemIndex;
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

const getWholeNoteWidthUnitForTimeSignature = (
  timeSignature: TimeSignature
) => {
  let widthUnit = noteWidthUnitMap[NoteType.W];

  switch (timeSignature.beatsPerMeasure) {
    case 3:
      widthUnit = noteWidthUnitMap[NoteType.H] * 1.5;
      break;
    case 2:
      widthUnit = noteWidthUnitMap[NoteType.H];
      break;
    case 1:
      widthUnit = noteWidthUnitMap[NoteType.Q];
  }

  if (timeSignature.complexity === TimeSignatureComplexity.COMPOUND) {
    widthUnit = widthUnit * (3 / 2);
  }

  return widthUnit;
};

const getNoteGroupWidthUnits = (
  noteGroup: GeneratedNoteGroup,
  timeSignature: TimeSignature
): number => {
  return noteGroup.notes.reduce((sum, note) => {
    let nextWidthUnit = note.widthUnit;

    // Adjust spacing for the fact that a whole rest will always be equal to the duration of
    // the time signature
    if (note.rest && note.type === NoteType.W) {
      nextWidthUnit = getWholeNoteWidthUnitForTimeSignature(timeSignature);
    }

    return (sum += nextWidthUnit);
  }, 0);
};

const getMeasureWidthUnits = (
  measure: Measure,
  timeSignature: TimeSignature
): number => {
  return measure.noteGroups.reduce((sum, noteGroup) => {
    return (sum += getNoteGroupWidthUnits(noteGroup, timeSignature));
  }, 0);
};

export const calculateMeasureWidths = (
  system: System,
  scoreDimensionConfig: ScoreDimensionConfig,
  timeSignature: TimeSignature
) => {
  const measureWidthUnits = system.measures.map((measure) => {
    return getMeasureWidthUnits(measure, timeSignature);
  });

  const totalWidthUnits = measureWidthUnits.reduce(
    (sum, widthUnit) => (sum += widthUnit),
    0
  );

  const systemMeasureWidth =
    system.measures.length * scoreDimensionConfig.defaultMeasureWidth;
  const widthUnitSize = systemMeasureWidth / totalWidthUnits;

  return measureWidthUnits.map((measureWidthUnit) => {
    return measureWidthUnit * widthUnitSize;
  });
};
