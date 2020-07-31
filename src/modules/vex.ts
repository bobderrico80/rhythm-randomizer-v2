import Vex from 'vexflow';
import { NoteGroup, NoteType } from './note';
import { TimeSignature } from './time-signature';

const VF = Vex.Flow;

const SCORE_PADDING_LEFT = 10;
const SCORE_PADDING_RIGHT = 10;
const SCORE_PADDING_TOP = 40;
const SCORE_PADDING_BOTTOM = 40;

const SYSTEM_VERTICAL_OFFSET = 150;
const DEFAULT_MEASURE_WIDTH = 300;
const MEASURES_PER_SYSTEM = 4;

const DEFAULT_CLEF = 'percussion';
const DEFAULT_PITCHES = ['b/4'];
const WHOLE_REST_CENTERING_OFFSET_PERCENT = 0.43;

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

const getContext = (targetElement: HTMLElement, measures: Measure[]) => {
  const scoreWidth =
    SCORE_PADDING_LEFT +
    DEFAULT_MEASURE_WIDTH * MEASURES_PER_SYSTEM +
    SCORE_PADDING_RIGHT;

  const numberOfSystems = Math.ceil(measures.length / MEASURES_PER_SYSTEM);

  const scoreHeight =
    SCORE_PADDING_TOP +
    SYSTEM_VERTICAL_OFFSET * numberOfSystems +
    SCORE_PADDING_BOTTOM;

  const renderer = new VF.Renderer(targetElement, VF.Renderer.Backends.SVG);
  renderer.resize(scoreWidth, scoreHeight);

  return renderer.getContext();
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
        staveNote.setXShift(
          DEFAULT_MEASURE_WIDTH * WHOLE_REST_CENTERING_OFFSET_PERCENT
        );
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
  totalSystems: number,
  timeSignature: TimeSignature,
  toRender: ToRender
): void => {
  const xOffset =
    SCORE_PADDING_LEFT + DEFAULT_MEASURE_WIDTH * measureIndexInSystem;
  const yOffset = SCORE_PADDING_TOP + SYSTEM_VERTICAL_OFFSET * systemIndex;

  const stave = new VF.Stave(xOffset, yOffset, DEFAULT_MEASURE_WIDTH);

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
  if (measureIndexInSystem === 0 && systemIndex === 0) {
    stave.addTimeSignature(timeSignature.type);
  }

  // If last measure of last system, set a final barline
  if (
    measureIndexInSystem === MEASURES_PER_SYSTEM - 1 &&
    systemIndex === totalSystems - 1
  ) {
    stave.setEndBarType(VF.Barline.type.END);
  }

  createNotes(measure.noteGroups, stave, toRender);
};

const createSystem = (
  system: System,
  systemIndex: number,
  totalSystems: number,
  timeSignature: TimeSignature,
  toRender: ToRender
): void => {
  system.measures.forEach((measure, measureIndex) => {
    createMeasure(
      measure,
      measureIndex,
      systemIndex,
      totalSystems,
      timeSignature,
      toRender
    );
  });
};

export const createScore = (
  targetElement: HTMLElement,
  measures: Measure[],
  timeSignature: TimeSignature
) => {
  const context = getContext(targetElement, measures);
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
