import Vex from 'vexflow';
import { NoteGroup, NoteType } from './note';
import { TimeSignature } from './time-signature';

const VF = Vex.Flow;

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

export interface Measure {
  noteGroups: NoteGroup[];
}

export interface System {
  measures: Measure[];
}

export interface ToRender {
  staveNotes: Map<Vex.Flow.Stave, Vex.Flow.StaveNote[]>;
  beams: Vex.Flow.Beam[];
  tuplets: Vex.Flow.Tuplet[];
}

const getContext = (
  targetElement: HTMLElement,
  measures: Measure[],
  innerWidth: number
) => {
  let effectiveMeasuresPerSystem = MEASURES_PER_SYSTEM;
  if (measures.length < effectiveMeasuresPerSystem) {
    effectiveMeasuresPerSystem = measures.length;
  }

  let resolvedScoreWidth = MAX_SCORE_WIDTH;

  const scoreWidth =
    SCORE_PADDING_LEFT +
    DEFAULT_MEASURE_WIDTH * effectiveMeasuresPerSystem +
    SCORE_PADDING_RIGHT;

  let scaleFactor = 1;

  if (scoreWidth < MAX_SCORE_WIDTH) {
    scaleFactor = MAX_SCORE_WIDTH / scoreWidth;
    resolvedScoreWidth = MAX_SCORE_WIDTH;
  }

  if (innerWidth < resolvedScoreWidth) {
    scaleFactor = innerWidth / scoreWidth;
    resolvedScoreWidth = innerWidth;
  }

  const numberOfSystems = Math.ceil(
    measures.length / effectiveMeasuresPerSystem
  );

  const scoreHeight =
    (SCORE_PADDING_TOP +
      SYSTEM_VERTICAL_OFFSET * numberOfSystems +
      SCORE_PADDING_BOTTOM) *
    scaleFactor;

  const renderer = new VF.Renderer(targetElement, VF.Renderer.Backends.SVG);
  renderer.resize(resolvedScoreWidth, scoreHeight);

  const context = renderer.getContext();

  context.scale(scaleFactor, scaleFactor);

  return context;
};

const getCurrentSystemIndex = (measureIndex: number, totalMeasures: number) =>
  Math.floor(
    measureIndex / totalMeasures / (MEASURES_PER_SYSTEM / totalMeasures)
  );

const splitMeasuresIntoSystems = (measures: Measure[]): System[] => {
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

const createNotes = (
  noteGroups: NoteGroup[],
  stave: Vex.Flow.Stave,
  measureWidth: number,
  inFirstMeasure: boolean,
  toRender: ToRender
): void => {
  noteGroups.forEach((noteGroup) => {
    const staveNotes = noteGroup.notes.map((note) => {
      const staveNote = new VF.StaveNote({
        clef: DEFAULT_CLEF,
        keys: DEFAULT_PITCHES,
        duration: note.type,
        stem_direction: VF.Stem.UP,
        auto_stem: false,
      });

      // Center the whole rest
      if (note.type === NoteType.WR) {
        let offsetPercent = WHOLE_REST_CENTERING_OFFSET;

        if (inFirstMeasure) {
          offsetPercent += WHOLE_REST_CENTERING_FIRST_MEASURE_ADDITIONAL_OFFSET;
        }

        staveNote.setXShift(measureWidth * offsetPercent);
      }

      if (note.dotted) {
        staveNote.addDot(0);
      }

      return staveNote;
    });

    if (noteGroup.beam) {
      toRender.beams.push(new VF.Beam(staveNotes, false));
    }

    if (noteGroup.tuplet) {
      toRender.tuplets.push(new VF.Tuplet(staveNotes));
    }

    const previousStaveNotes = toRender.staveNotes.get(stave);

    if (previousStaveNotes) {
      toRender.staveNotes.set(stave, [...previousStaveNotes, ...staveNotes]);
    } else {
      toRender.staveNotes.set(stave, staveNotes);
    }
  });
};

const createMeasure = (
  measure: Measure,
  measureIndexInSystem: number,
  systemIndex: number,
  isFinalMeasure: boolean,
  measureWidths: number[],
  timeSignature: TimeSignature,
  toRender: ToRender
): void => {
  let previousMeasureOffsets = 0;
  for (let i = 0; i < measureIndexInSystem; i++) {
    previousMeasureOffsets += measureWidths[i];
  }

  const xOffset = SCORE_PADDING_LEFT + previousMeasureOffsets;
  const yOffset = SCORE_PADDING_TOP + SYSTEM_VERTICAL_OFFSET * systemIndex;
  const measureWidth = measureWidths[measureIndexInSystem];
  const inFirstMeasure = measureIndexInSystem === 0 && systemIndex === 0;

  const stave = new VF.Stave(xOffset, yOffset, measureWidth);

  // Setup 1-line stave
  stave
    .setConfigForLine(0, { visible: false })
    .setConfigForLine(1, { visible: false })
    .setConfigForLine(2, { visible: true })
    .setConfigForLine(3, { visible: false })
    .setConfigForLine(4, { visible: false });

  // If first measure in system, add the clef
  if (measureIndexInSystem === 0) {
    stave.setBegBarType(VF.Barline.type.NONE);
    stave.addClef(DEFAULT_CLEF);
  }

  // If first measure of first system, add the time signature
  if (inFirstMeasure) {
    stave.addTimeSignature(timeSignature.type);
  }

  // If last measure of last system, set a final barline
  if (isFinalMeasure) {
    stave.setEndBarType(VF.Barline.type.END);
  }

  createNotes(
    measure.noteGroups,
    stave,
    measureWidth,
    inFirstMeasure,
    toRender
  );
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

const createSystem = (
  system: System,
  systemIndex: number,
  totalSystems: number,
  timeSignature: TimeSignature,
  toRender: ToRender
): void => {
  const isFinalSystem = systemIndex === totalSystems - 1;
  const measureWidthUnits = system.measures.map((measure) => {
    return getMeasureWidthUnits(measure);
  });

  const totalWidthUnits = measureWidthUnits.reduce(
    (sum, widthUnit) => (sum += widthUnit),
    0
  );

  const systemMeasureWidth = system.measures.length * DEFAULT_MEASURE_WIDTH;
  const widthUnitSize = systemMeasureWidth / totalWidthUnits;

  const measureWidths = measureWidthUnits.map((measureWidthUnit) => {
    return measureWidthUnit * widthUnitSize;
  });

  system.measures.forEach((measure, measureIndex) => {
    createMeasure(
      measure,
      measureIndex,
      systemIndex,
      isFinalSystem && measureIndex === system.measures.length - 1,
      measureWidths,
      timeSignature,
      toRender
    );
  });
};

export const createScore = (
  targetElement: HTMLElement,
  measures: Measure[],
  timeSignature: TimeSignature,
  innerWidth: number
) => {
  const context = getContext(targetElement, measures, innerWidth);
  const systems = splitMeasuresIntoSystems(measures);
  const toRender: ToRender = { staveNotes: new Map(), beams: [], tuplets: [] };

  systems.forEach((system, systemIndex) => {
    createSystem(system, systemIndex, systems.length, timeSignature, toRender);
  });

  toRender.staveNotes.forEach((notes, stave) => {
    stave.setContext(context).draw();
    VF.Formatter.FormatAndDraw(context, stave, notes);
  });

  toRender.beams.forEach((beam) => {
    beam.setContext(context).draw();
  });

  toRender.tuplets.forEach((tuplet) => {
    tuplet.setContext(context).draw();
  });
};
