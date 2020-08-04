import Vex from 'vexflow';
import { NoteGroup } from './note';
import { TimeSignature } from './time-signature';
import {
  getScoreDimensions,
  splitMeasuresIntoSystems,
  getNoteConfiguration,
  getMeasureConfiguration,
  MeasureConfiguration,
  calculateMeasureWidths,
} from './score';

const VF = Vex.Flow;

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
  const dimensions = getScoreDimensions(measures.length, innerWidth);

  const renderer = new VF.Renderer(targetElement, VF.Renderer.Backends.SVG);
  renderer.resize(dimensions.width, dimensions.height);

  const context = renderer.getContext();
  context.scale(dimensions.scaleFactor, dimensions.scaleFactor);

  return context;
};

const createNotes = (
  noteGroups: NoteGroup[],
  stave: Vex.Flow.Stave,
  measureConfiguration: MeasureConfiguration,
  toRender: ToRender
): void => {
  noteGroups.forEach((noteGroup) => {
    const staveNotes = noteGroup.notes.map((note) => {
      const noteConfiguration = getNoteConfiguration(
        note,
        measureConfiguration.measureWidth,
        measureConfiguration.firstMeasure
      );

      const staveNote = new VF.StaveNote({
        clef: noteConfiguration.clef,
        keys: noteConfiguration.keys,
        duration: noteConfiguration.duration,
        stem_direction: noteConfiguration.stemDirection,
        auto_stem: noteConfiguration.autoStem,
      });

      if (noteConfiguration.xShift) {
        staveNote.setXShift(noteConfiguration.xShift);
      }

      if (noteConfiguration.addDot) {
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
  finalMeasure: boolean,
  measureWidths: number[],
  timeSignature: TimeSignature,
  toRender: ToRender
): void => {
  const measureConfiguration = getMeasureConfiguration(
    systemIndex,
    measureIndexInSystem,
    measureWidths,
    finalMeasure,
    timeSignature
  );

  const stave = new VF.Stave(
    measureConfiguration.xOffset,
    measureConfiguration.yOffset,
    measureConfiguration.measureWidth
  );

  measureConfiguration.staveLineConfig.forEach((visible, lineNumber) => {
    stave.setConfigForLine(lineNumber, { visible });
  });

  stave.setBegBarType(measureConfiguration.beginningBarline);
  stave.setEndBarType(measureConfiguration.endBarline);

  if (measureConfiguration.clef) {
    stave.addClef(measureConfiguration.clef);
  }

  if (measureConfiguration.timeSignature) {
    stave.addTimeSignature(measureConfiguration.timeSignature);
  }

  createNotes(measure.noteGroups, stave, measureConfiguration, toRender);
};

const createSystem = (
  system: System,
  systemIndex: number,
  totalSystems: number,
  timeSignature: TimeSignature,
  toRender: ToRender
): void => {
  const isFinalSystem = systemIndex === totalSystems - 1;
  const measureWidths = calculateMeasureWidths(system);

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
