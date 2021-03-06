import Vex from 'vexflow';
import { GeneratedNoteGroup } from './note-definition';
import { TimeSignature } from './time-signature';
import {
  getScoreDimensions,
  splitMeasuresIntoSystems,
  getNoteConfiguration,
  getMeasureConfiguration,
  MeasureConfiguration,
  calculateMeasureWidths,
  ScoreData,
  ScoreDimensionConfig,
} from './score';

const VF = Vex.Flow;

export interface Measure {
  noteGroups: GeneratedNoteGroup[];
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
  innerWidth: number,
  measuresPerSystem: number,
  scoreDimensionConfig: ScoreDimensionConfig
) => {
  const dimensions = getScoreDimensions(
    measures.length,
    innerWidth,
    measuresPerSystem,
    scoreDimensionConfig
  );

  const renderer = new VF.Renderer(targetElement, VF.Renderer.Backends.SVG);
  renderer.resize(dimensions.width, dimensions.height);

  const context = renderer.getContext();
  context.scale(dimensions.scaleFactor, dimensions.scaleFactor);

  return context;
};

const createNotes = (
  noteGroups: GeneratedNoteGroup[],
  stave: Vex.Flow.Stave,
  measureConfiguration: MeasureConfiguration,
  toRender: ToRender,
  scoreDimensionConfig: ScoreDimensionConfig
): void => {
  noteGroups.forEach((noteGroup) => {
    const staveNotes = noteGroup.notes.map((note) => {
      const noteConfiguration = getNoteConfiguration(
        note,
        measureConfiguration.measureWidth,
        measureConfiguration.firstMeasure,
        scoreDimensionConfig
      );

      const staveNote = new VF.StaveNote({
        clef: noteConfiguration.clef,
        keys: noteConfiguration.keys,
        duration: noteConfiguration.duration + (note.rest ? 'r' : ''),
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
      let staveNotesToBeam = staveNotes;

      if (typeof noteGroup.beam === 'string') {
        const [start, end] = noteGroup.beam.split('-');
        staveNotesToBeam = staveNotesToBeam.slice(
          parseInt(start),
          parseInt(end) + 1
        );
      }

      toRender.beams.push(new VF.Beam(staveNotesToBeam, false));
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
  toRender: ToRender,
  scoreDimensionConfig: ScoreDimensionConfig
): void => {
  const measureConfiguration = getMeasureConfiguration(
    systemIndex,
    measureIndexInSystem,
    measureWidths,
    finalMeasure,
    timeSignature,
    scoreDimensionConfig
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

  createNotes(
    measure.noteGroups,
    stave,
    measureConfiguration,
    toRender,
    scoreDimensionConfig
  );
};

const createSystem = (
  system: System,
  systemIndex: number,
  totalSystems: number,
  timeSignature: TimeSignature,
  toRender: ToRender,
  scoreDimensionConfig: ScoreDimensionConfig
): void => {
  const isFinalSystem = systemIndex === totalSystems - 1;
  const measureWidths = calculateMeasureWidths(
    system,
    scoreDimensionConfig,
    timeSignature
  );

  system.measures.forEach((measure, measureIndex) => {
    createMeasure(
      measure,
      measureIndex,
      systemIndex,
      isFinalSystem && measureIndex === system.measures.length - 1,
      measureWidths,
      timeSignature,
      toRender,
      scoreDimensionConfig
    );
  });
};

export const createScore = (
  targetElement: HTMLElement,
  scoreData: ScoreData,
  innerWidth: number,
  measuresPerSystem: number,
  scoreDimensionConfig: ScoreDimensionConfig
) => {
  const { measures, timeSignature } = scoreData;
  const context = getContext(
    targetElement,
    measures,
    innerWidth,
    measuresPerSystem,
    scoreDimensionConfig
  );
  const systems = splitMeasuresIntoSystems(measures, measuresPerSystem);
  const toRender: ToRender = { staveNotes: new Map(), beams: [], tuplets: [] };

  systems.forEach((system, systemIndex) => {
    createSystem(
      system,
      systemIndex,
      systems.length,
      timeSignature,
      toRender,
      scoreDimensionConfig
    );
  });

  toRender.staveNotes.forEach((notes, stave) => {
    stave.setContext(context).draw();

    // Manually doing what Formatter.FormatAndDraw() did before for more control over how the notes
    // are spaced.
    // See https://github.com/0xfe/vexflow/blob/1458abaf2206343a786ecfaebeea680565607f67/src/formatter.js#L200
    const voice = new VF.Voice(VF.TIME4_4)
      .setMode(VF.Voice.Mode.SOFT)
      .addTickables(notes);

    // `10` seems to prevent large duration notes from taking up too much of the measure, squishing
    // smaller beamed durations
    new VF.Formatter({ softmaxFactor: 10 })
      .joinVoices([voice])
      .formatToStave([voice], stave);

    voice.setStave(stave).draw(context, stave);
  });

  toRender.beams.forEach((beam) => {
    beam.setContext(context).draw();
  });

  toRender.tuplets.forEach((tuplet) => {
    tuplet.setContext(context).draw();
  });
};
