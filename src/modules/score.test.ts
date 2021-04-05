import Vex from 'vexflow';
import {
  getScoreDimensions,
  splitMeasuresIntoSystems,
  getNoteConfiguration,
  getMeasureConfiguration,
  ScoreDimensions,
  NoteConfiguration,
  MeasureConfiguration,
  calculateMeasureWidths,
  ScoreDimensionConfig,
} from './score';
import { Measure, System } from './vex';
import {
  Note,
  NoteGroupType,
  getGeneratedNoteGroup,
  getGeneratedNoteGroups,
} from './note';
import {
  getTimeSignature,
  TimeSignatureType,
  TimeSignature,
} from './time-signature';

interface SetupMeasureConfig {
  systemIndex?: number;
  measureIndexInSystem?: number;
  measureWidths?: number[];
  finalMeasure?: boolean;
  timeSignature?: TimeSignature;
}

const scoreDimensionConfig: ScoreDimensionConfig = {
  paddingLeft: 10,
  paddingRight: 10,
  paddingTop: 40,
  paddingBottom: 40,
  maxWidth: 1220,
  systemVerticalOffset: 150,
  defaultMeasureWidth: 300,
  wholeRestCenteringOffset: 0.43,
  wholeRestCenteringFirstMeasureAdditionalOffset: -0.1,
  dottedWholeRestCenteringAdditionalOffset: -0.05,
};

const setupMeasureConfiguration = (config: SetupMeasureConfig = {}) => {
  const resolvedConfig: SetupMeasureConfig = {
    systemIndex: 0,
    measureIndexInSystem: 0,
    measureWidths: [200, 300, 300, 400],
    finalMeasure: false,
    timeSignature: getTimeSignature(TimeSignatureType.SIMPLE_4_4),
    ...config,
  };

  return getMeasureConfiguration(
    resolvedConfig.systemIndex!,
    resolvedConfig.measureIndexInSystem!,
    resolvedConfig.measureWidths!,
    resolvedConfig.finalMeasure!,
    resolvedConfig.timeSignature!,
    scoreDimensionConfig
  );
};

describe('The score module', () => {
  let dimensions: ScoreDimensions;

  describe('getScoreDimensions() function', () => {
    describe('where score width can equal the score max size', () => {
      beforeEach(() => {
        dimensions = getScoreDimensions(4, 2000, 4, scoreDimensionConfig);
      });

      it('has a width equal to the max score width', () => {
        expect(dimensions.width).toEqual(1220);
      });

      it('requires no scaling', () => {
        expect(dimensions.scaleFactor).toEqual(1);
      });
    });

    describe('with one system-worth of measures', () => {
      beforeEach(() => {
        dimensions = getScoreDimensions(4, 2000, 4, scoreDimensionConfig);
      });

      it('has a height to accommodate one system', () => {
        expect(dimensions.height).toEqual(230);
      });
    });

    describe('with more than one system-worth of measures', () => {
      beforeEach(() => {
        dimensions = getScoreDimensions(8, 2000, 4, scoreDimensionConfig);
      });

      it('has a height to accommodate multiple systems', () => {
        expect(dimensions.height).toEqual(380);
      });
    });

    describe('with a score width smaller than the window inner width', () => {
      beforeEach(() => {
        dimensions = getScoreDimensions(4, 610, 4, scoreDimensionConfig);
      });

      it('has a width equal to the window inner width', () => {
        expect(dimensions.width).toEqual(610);
      });

      it('has a height scaled proportionally to the smaller width', () => {
        expect(dimensions.height).toEqual(115);
      });

      it('calculates an appropriate scale factor', () => {
        expect(dimensions.scaleFactor).toEqual(0.5);
      });
    });

    describe('with a score width smaller than the max score width', () => {
      beforeEach(() => {
        dimensions = getScoreDimensions(2, 2000, 4, scoreDimensionConfig);
      });

      it('has a width equal to the maximum score width', () => {
        expect(dimensions.width).toEqual(1220);
      });

      it('scales the height in accordance with the scaled width', () => {
        expect(dimensions.height).toBeCloseTo(453, 0);
      });

      it('calculates the appropriate scale factor', () => {
        expect(dimensions.scaleFactor).toBeCloseTo(2, 0);
      });
    });
  });

  describe('splitMeasuresIntoSystems() function', () => {
    let measures: Measure[];
    let systems: System[];

    describe('with one full system of measures', () => {
      beforeEach(() => {
        measures = [
          { noteGroups: [] },
          { noteGroups: [] },
          { noteGroups: [] },
          { noteGroups: [] },
        ];
        systems = splitMeasuresIntoSystems(measures, 4);
      });

      it('returns one system', () => {
        expect(systems).toHaveLength(1);
      });

      it('places all measures into the system', () => {
        expect(systems[0].measures).toHaveLength(4);
      });
    });

    describe('with multiple systems of measures', () => {
      beforeEach(() => {
        measures = [
          { noteGroups: [] },
          { noteGroups: [] },
          { noteGroups: [] },
          { noteGroups: [] },
          { noteGroups: [] },
          { noteGroups: [] },
          { noteGroups: [] },
          { noteGroups: [] },
        ];
        systems = splitMeasuresIntoSystems(measures, 2);
      });

      it('returns expected number of systems', () => {
        expect(systems).toHaveLength(4);
      });

      it('places expected number of measures into both systems', () => {
        systems.forEach((system) => {
          expect(system.measures).toHaveLength(2);
        });
      });
    });

    describe('with less than one system-worth of measures', () => {
      beforeEach(() => {
        measures = [{ noteGroups: [] }, { noteGroups: [] }];
        systems = splitMeasuresIntoSystems(measures, 4);
      });

      it('returns one system', () => {
        expect(systems).toHaveLength(1);
      });

      it('places all measures the system', () => {
        expect(systems[0].measures).toHaveLength(2);
      });
    });

    describe('with an unbalanced number of measures', () => {
      beforeEach(() => {
        measures = [
          { noteGroups: [] },
          { noteGroups: [] },
          { noteGroups: [] },
          { noteGroups: [] },
          { noteGroups: [] },
        ];
        systems = splitMeasuresIntoSystems(measures, 4);
      });

      it('returns expected number systems, including a system for the "left over" measures', () => {
        expect(systems).toHaveLength(2);
      });

      it('places configured measures per per system into the full systems', () => {
        expect(systems[0].measures).toHaveLength(4);
      });

      it('places remaining measures in the additional system', () => {
        expect(systems[1].measures).toHaveLength(1);
      });
    });
  });

  describe('getNoteConfiguration() function', () => {
    const measureWidth = 300;

    let inFirstMeasure: boolean;
    let note: Note;
    let noteConfiguration: NoteConfiguration;

    describe('with non-dotted notes with standard behavior', () => {
      beforeEach(() => {
        inFirstMeasure = false;
        note = getGeneratedNoteGroup(NoteGroupType.Q).notes[0];
        noteConfiguration = getNoteConfiguration(
          note,
          measureWidth,
          inFirstMeasure,
          scoreDimensionConfig
        );
      });

      it('returns a note configuration with the expected clef', () => {
        expect(noteConfiguration.clef).toEqual('percussion');
      });

      it('returns a note configuration with the expected keys', () => {
        expect(noteConfiguration.keys).toEqual(['b/4']);
      });

      it('returns a note configuration with the expected stem direction', () => {
        expect(noteConfiguration.stemDirection).toEqual(1);
      });

      it('returns a note configuration with the expected auto-stem setting', () => {
        expect(noteConfiguration.autoStem).toEqual(false);
      });

      it('returns a note configuration with the expected addDot setting', () => {
        expect(noteConfiguration.addDot).toEqual(false);
      });

      it('returns a note configuration with the expected duration value', () => {
        expect(noteConfiguration.duration).toEqual('q');
      });

      it('returns a note configuration that does not include an xShift value', () => {
        expect(noteConfiguration.xShift).not.toBeDefined();
      });
    });

    describe('with dotted notes', () => {
      beforeEach(() => {
        inFirstMeasure = false;
        note = getGeneratedNoteGroup(NoteGroupType.HD).notes[0];
        noteConfiguration = getNoteConfiguration(
          note,
          measureWidth,
          inFirstMeasure,
          scoreDimensionConfig
        );
      });

      it('returns a note configuration with the expected addDot setting', () => {
        expect(noteConfiguration.addDot).toEqual(true);
      });
    });

    describe('with whole rests in a non-first measure', () => {
      beforeEach(() => {
        inFirstMeasure = false;
        note = getGeneratedNoteGroup(NoteGroupType.WR).notes[0];
        noteConfiguration = getNoteConfiguration(
          note,
          measureWidth,
          inFirstMeasure,
          scoreDimensionConfig
        );
      });

      it('returns a note configuration with the expected x-shift value', () => {
        expect(noteConfiguration.xShift).toEqual(129);
      });
    });

    describe('with whole rests in the first measure', () => {
      beforeEach(() => {
        inFirstMeasure = true;
        note = getGeneratedNoteGroup(NoteGroupType.WR).notes[0];
        noteConfiguration = getNoteConfiguration(
          note,
          measureWidth,
          inFirstMeasure,
          scoreDimensionConfig
        );
      });

      it('returns a note configuration with the expected x-shift value', () => {
        expect(noteConfiguration.xShift).toBeCloseTo(99, 0);
      });
    });
  });

  describe('getMeasureConfiguration function', () => {
    let measureConfiguration: MeasureConfiguration;

    describe('common measure configuration', () => {
      beforeEach(() => {
        measureConfiguration = setupMeasureConfiguration();
      });

      it('sets the staveLineConfig as expected', () => {
        expect(measureConfiguration.staveLineConfig).toEqual([
          false,
          false,
          true,
          false,
          false,
        ]);
      });

      it('sets the measureWidth to the expected value from the measureWidths array', () => {
        expect(measureConfiguration.measureWidth).toEqual(200);
      });
    });

    describe('with the first measure in the score', () => {
      beforeEach(() => {
        measureConfiguration = setupMeasureConfiguration({
          systemIndex: 0,
          measureIndexInSystem: 0,
        });
      });

      it('sets the time signature to the provided time signature type', () => {
        expect(measureConfiguration.timeSignature).toEqual(
          getTimeSignature(TimeSignatureType.SIMPLE_4_4).type
        );
      });
    });

    describe('with any non-first measure in the score', () => {
      beforeEach(() => {
        measureConfiguration = setupMeasureConfiguration({
          systemIndex: 0,
          measureIndexInSystem: 1,
        });
      });

      it('does not set the time signature', () => {
        expect(measureConfiguration.timeSignature).not.toBeDefined();
      });
    });

    describe('with the first measure in a system', () => {
      beforeEach(() => {
        measureConfiguration = setupMeasureConfiguration({
          systemIndex: 1,
          measureIndexInSystem: 0,
        });
      });

      it('sets the xOffset to only include the score left padding', () => {
        expect(measureConfiguration.xOffset).toEqual(10);
      });

      it('sets the beginning barline style to NONE', () => {
        expect(measureConfiguration.beginningBarline).toEqual(
          Vex.Flow.Barline.type.NONE
        );
      });
    });

    describe('with any measure in the first system', () => {
      beforeEach(() => {
        measureConfiguration = setupMeasureConfiguration({
          systemIndex: 0,
          measureIndexInSystem: 1,
        });
      });

      it('sets the yOffset to only include the score top padding', () => {
        expect(measureConfiguration.yOffset).toEqual(40);
      });
    });

    describe('with any subsequent measure in a system', () => {
      beforeEach(() => {
        measureConfiguration = setupMeasureConfiguration({
          systemIndex: 1,
          measureIndexInSystem: 2,
        });
      });

      it('sets the xOffset to include the score left padding, plus the size of previous measures', () => {
        expect(measureConfiguration.xOffset).toEqual(510);
      });

      it('sets the beginning barline style to SINGLE', () => {
        expect(measureConfiguration.beginningBarline).toEqual(
          Vex.Flow.Barline.type.SINGLE
        );
      });
    });

    describe('with any measure in any subsequent system', () => {
      beforeEach(() => {
        measureConfiguration = setupMeasureConfiguration({
          systemIndex: 2,
          measureIndexInSystem: 2,
        });
      });

      it('sets the yOffset to include the score top padding plus vertical offsets for any additional systems', () => {
        expect(measureConfiguration.yOffset).toEqual(340);
      });
    });

    describe('with any non-final measure', () => {
      beforeEach(() => {
        measureConfiguration = setupMeasureConfiguration({
          systemIndex: 2,
          measureIndexInSystem: 2,
        });
      });

      it('sets the end barline style to SINGLE', () => {
        expect(measureConfiguration.endBarline).toEqual(
          Vex.Flow.Barline.type.SINGLE
        );
      });
    });

    describe('with the final measure', () => {
      beforeEach(() => {
        measureConfiguration = setupMeasureConfiguration({
          finalMeasure: true,
        });
      });

      it('sets the end barline style to END', () => {
        expect(measureConfiguration.endBarline).toEqual(
          Vex.Flow.Barline.type.END
        );
      });
    });
  });

  describe('calculateMeasureWidths() function', () => {
    let measureWidths: number[];
    let system: System;

    describe('with measures where width units are evenly distributed across all measures', () => {
      beforeEach(() => {
        system = {
          measures: [
            { noteGroups: [getGeneratedNoteGroup(NoteGroupType.W)] },
            { noteGroups: [getGeneratedNoteGroup(NoteGroupType.WR)] },
            { noteGroups: [getGeneratedNoteGroup(NoteGroupType.W)] },
            { noteGroups: [getGeneratedNoteGroup(NoteGroupType.WR)] },
          ],
        };
        measureWidths = calculateMeasureWidths(system, scoreDimensionConfig);
      });

      it('includes measure widths that are all equal (to the default measure width)', () => {
        measureWidths.forEach((width) => expect(width).toEqual(300));
      });

      it('all measure widths add up to the expected width', () => {
        expect(measureWidths.reduce((sum, width) => sum + width, 0)).toEqual(
          1200
        );
      });
    });

    describe('with measures where width units are not evenly distributed across all measures', () => {
      beforeEach(() => {
        system = {
          measures: [
            { noteGroups: [getGeneratedNoteGroup(NoteGroupType.W)] },
            {
              noteGroups: getGeneratedNoteGroups(
                NoteGroupType.H,
                NoteGroupType.H
              ),
            },
            {
              noteGroups: getGeneratedNoteGroups(
                NoteGroupType.Q,
                NoteGroupType.Q,
                NoteGroupType.Q,
                NoteGroupType.Q
              ),
            },
            {
              noteGroups: getGeneratedNoteGroups(
                NoteGroupType.EE,
                NoteGroupType.EE,
                NoteGroupType.EE,
                NoteGroupType.EE
              ),
            },
          ],
        };
        measureWidths = calculateMeasureWidths(system, scoreDimensionConfig);
      });

      it('includes measure widths that are proportional to the distribution of width units', () => {
        expect(measureWidths[0]).toBeCloseTo(214, 0);
        expect(measureWidths[1]).toBeCloseTo(263, 0);
        expect(measureWidths[2]).toBeCloseTo(329, 0);
        expect(measureWidths[3]).toBeCloseTo(395, 0);
      });

      it('all measure widths add up to the expected width', () => {
        expect(measureWidths.reduce((sum, width) => sum + width, 0)).toEqual(
          1200
        );
      });
    });
  });
});
