import { DEFAULT_PITCH, DEFAULT_TEMPO } from '../App';
import {
  getNoteGroupTypeSelectionMap,
  NoteGroupType,
  NoteGroupTypeSelectionMap,
  setNoteGroupTypeSelections,
} from './note';
import {
  getPersistedAppState,
  persistAppState,
  PersistedAppState,
} from './persisted-state';
import { getRandomMeasures } from './random';
import { ScoreData } from './score';
import { getTimeSignature, TimeSignatureType } from './time-signature';
import { Octave, Pitch, PitchClass } from './tone';
import { Measure } from './vex';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const filterIconProperty = ({ icon, ...others }: any) => ({ ...others });

const filterIconPropertyFromMeasures = (measures: Measure[]) => {
  return measures.map((measure) => {
    return {
      ...measure,
      noteGroups: measure.noteGroups.map(filterIconProperty),
    };
  });
};

const verifyScoreNoteGroupTypes = (
  scoreData: ScoreData,
  ...expectedNoteGroupTypes: NoteGroupType[]
) => {
  const noteGroupTypesSet = scoreData.measures.reduce(
    (previousSet, measure) => {
      measure.noteGroups.forEach((noteGroup) => {
        previousSet.add(noteGroup.type);
      });
      return previousSet;
    },
    new Set<NoteGroupType>()
  );

  [...noteGroupTypesSet].forEach((noteGroupType) => {
    expect(expectedNoteGroupTypes).toContain(noteGroupType);
  });
};

const setupLocalStorageScoreSettings = (
  noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap,
  measureCount: number,
  timeSignatureType: TimeSignatureType,
  tempo?: number,
  pitch?: Pitch
) => {
  localStorage.setItem(
    'rr.scoreSettings',
    JSON.stringify({
      measureCount,
      timeSignatureType,
      noteGroupTypeSelectionMap,
      tempo,
      pitch,
    })
  );
};

const setupLocalStorageScoreData = (
  randomMeasures: Measure[],
  timeSignatureType: TimeSignatureType
) => {
  localStorage.setItem(
    'rr.scoreData',
    JSON.stringify({
      timeSignature: getTimeSignature(timeSignatureType),
      measures: randomMeasures,
    })
  );
};

describe('The persisted-state module', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockClear();
    localStorage.clear();
  });

  describe('getPersistedAppState() function', () => {
    let persistedAppState: PersistedAppState;

    describe('with previously valid persisted state', () => {
      let noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap;
      let randomMeasures: Measure[];

      beforeEach(() => {
        noteGroupTypeSelectionMap = getNoteGroupTypeSelectionMap(3);
        randomMeasures = getRandomMeasures(noteGroupTypeSelectionMap, 2, 4);
        setupLocalStorageScoreSettings(
          noteGroupTypeSelectionMap,
          4,
          TimeSignatureType.SIMPLE_3_4,
          120,
          { pitchClass: PitchClass.Bb, octave: Octave._4 }
        );
        setupLocalStorageScoreData(
          randomMeasures,
          TimeSignatureType.SIMPLE_3_4
        );

        persistedAppState = getPersistedAppState();
      });

      it('returns expected measure count', () => {
        expect(persistedAppState.scoreSettings.measureCount).toEqual(4);
      });

      it('returns expected time signature type', () => {
        expect(persistedAppState.scoreSettings.timeSignatureType).toEqual(
          TimeSignatureType.SIMPLE_3_4
        );
      });

      it('returns the expected note group type selection map', () => {
        expect(
          persistedAppState.scoreSettings.noteGroupTypeSelectionMap
        ).toEqual(noteGroupTypeSelectionMap);
      });

      it('returns expected tempo', () => {
        expect(persistedAppState.scoreSettings.tempo).toEqual(120);
      });

      it('returns expected pitch', () => {
        expect(persistedAppState.scoreSettings.pitch).toEqual({
          pitchClass: PitchClass.Bb,
          octave: Octave._4,
        });
      });

      it('returns the expected score time signature', () => {
        expect(persistedAppState.scoreData.timeSignature).toMatchObject(
          filterIconProperty(getTimeSignature(TimeSignatureType.SIMPLE_3_4))
        );
      });

      it('returns the expected measures', () => {
        expect(persistedAppState.scoreData.measures).toMatchObject(
          filterIconPropertyFromMeasures(randomMeasures)
        );
      });
    });

    describe('with previous persisted state that does not include tempo or pitch information', () => {
      let noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap;
      let randomMeasures: Measure[];

      beforeEach(() => {
        noteGroupTypeSelectionMap = getNoteGroupTypeSelectionMap(3);
        randomMeasures = getRandomMeasures(noteGroupTypeSelectionMap, 2, 4);
        setupLocalStorageScoreSettings(
          noteGroupTypeSelectionMap,
          4,
          TimeSignatureType.SIMPLE_3_4
        );
        setupLocalStorageScoreData(
          randomMeasures,
          TimeSignatureType.SIMPLE_3_4
        );

        persistedAppState = getPersistedAppState();
      });

      it('returns expected measure count', () => {
        expect(persistedAppState.scoreSettings.measureCount).toEqual(4);
      });

      it('returns expected time signature type', () => {
        expect(persistedAppState.scoreSettings.timeSignatureType).toEqual(
          TimeSignatureType.SIMPLE_3_4
        );
      });

      it('returns the expected note group type selection map', () => {
        expect(
          persistedAppState.scoreSettings.noteGroupTypeSelectionMap
        ).toEqual(noteGroupTypeSelectionMap);
      });

      it('returns the default tempo', () => {
        expect(persistedAppState.scoreSettings.tempo).toEqual(DEFAULT_TEMPO);
      });

      it('returns the default pitch', () => {
        expect(persistedAppState.scoreSettings.pitch).toEqual(DEFAULT_PITCH);
      });

      it('returns the expected score time signature', () => {
        expect(persistedAppState.scoreData.timeSignature).toMatchObject(
          filterIconProperty(getTimeSignature(TimeSignatureType.SIMPLE_3_4))
        );
      });

      it('returns the expected measures', () => {
        expect(persistedAppState.scoreData.measures).toMatchObject(
          filterIconPropertyFromMeasures(randomMeasures)
        );
      });
    });

    describe('with previous states resulting in the default state', () => {
      const suites: { description: string; setup: () => string | void }[] = [
        { description: 'with no previous persisted state', setup: () => {} },
        {
          description:
            'with no previous persisted state, and an invalid share string',
          setup: () => {
            return 'foobar';
          },
        },
        {
          description: 'with persisted score settings, but no score data',
          setup: () => {
            setupLocalStorageScoreSettings(
              getNoteGroupTypeSelectionMap(3),
              4,
              TimeSignatureType.SIMPLE_3_4
            );
          },
        },
        {
          description: 'with persisted score data, but no score settings',
          setup: () => {
            setupLocalStorageScoreData(
              getRandomMeasures(getNoteGroupTypeSelectionMap(2), 2, 4),
              TimeSignatureType.SIMPLE_3_4
            );
          },
        },
        {
          description:
            'with persisted settings and score data with empty measures',
          setup: () => {
            const noteGroupTypeSelectionMap = getNoteGroupTypeSelectionMap(3);
            setupLocalStorageScoreSettings(
              noteGroupTypeSelectionMap,
              4,
              TimeSignatureType.SIMPLE_3_4
            );
            setupLocalStorageScoreData([], TimeSignatureType.SIMPLE_3_4);
          },
        },
        {
          description: 'with an error occurring during local storage retrieval',
          setup: () => {
            localStorage.setItem('rr.scoreSettings', '!@#$%%^NOT PARSABLE');
          },
        },
      ];

      suites.forEach(({ description, setup }) => {
        describe(description, () => {
          beforeEach(() => {
            const shareString = setup() as string | undefined;
            persistedAppState = getPersistedAppState(shareString);
          });

          it('returns the default measure count', () => {
            expect(persistedAppState.scoreSettings.measureCount).toEqual(2);
          });

          it('returns the default time signature type', () => {
            expect(persistedAppState.scoreSettings.timeSignatureType).toEqual(
              TimeSignatureType.SIMPLE_4_4
            );
          });

          it('returns the default note group type selection map', () => {
            expect(
              persistedAppState.scoreSettings.noteGroupTypeSelectionMap
            ).toEqual(getNoteGroupTypeSelectionMap(4));
          });

          it('returns the default tempo', () => {
            expect(persistedAppState.scoreSettings.tempo).toEqual(
              DEFAULT_TEMPO
            );
          });

          it('returns the default pitch', () => {
            expect(persistedAppState.scoreSettings.pitch).toEqual(
              DEFAULT_PITCH
            );
          });

          it('returns default number of measures in the score', () => {
            expect(persistedAppState.scoreData.measures).toHaveLength(2);
          });

          it('returns the default score time signature', () => {
            expect(persistedAppState.scoreData.timeSignature).toEqual(
              getTimeSignature(TimeSignatureType.SIMPLE_4_4)
            );
          });

          it('returns a score with the expected note group types', () => {
            verifyScoreNoteGroupTypes(
              persistedAppState.scoreData,
              NoteGroupType.W,
              NoteGroupType.H,
              NoteGroupType.Q,
              NoteGroupType.WR,
              NoteGroupType.HR,
              NoteGroupType.QR,
              NoteGroupType.EE,
              NoteGroupType.SSSS
            );
          });
        });
      });
    });

    describe('with a valid share string query parameter', () => {
      describe('without a previous state', () => {
        beforeEach(() => {
          persistedAppState = getPersistedAppState('14212033000102');
        });

        it('returns the expected measure count from the share string', () => {
          expect(persistedAppState.scoreSettings.measureCount).toEqual(4);
        });

        it('returns the expected time signature', () => {
          expect(persistedAppState.scoreSettings.timeSignatureType).toEqual(
            TimeSignatureType.SIMPLE_4_4
          );
        });

        it('returns the expected selected notes', () => {
          const expectedNoteGroupTypeSelectionMap = setNoteGroupTypeSelections(
            getNoteGroupTypeSelectionMap(4),
            NoteGroupType.W,
            NoteGroupType.H,
            NoteGroupType.Q
          );
          expect(
            persistedAppState.scoreSettings.noteGroupTypeSelectionMap
          ).toEqual(expectedNoteGroupTypeSelectionMap);
        });

        it('returns the expected tempo', () => {
          expect(persistedAppState.scoreSettings.tempo).toEqual(120);
        });

        it('returns the expected pitch', () => {
          expect(persistedAppState.scoreSettings.pitch).toEqual({
            pitchClass: PitchClass.C,
            octave: Octave._3,
          });
        });

        it('returns a score with the expected measure count', () => {
          expect(persistedAppState.scoreData.measures.length).toEqual(4);
        });

        it('returns a score with the expected time signature', () => {
          expect(persistedAppState.scoreData.timeSignature).toEqual(
            getTimeSignature(TimeSignatureType.SIMPLE_4_4)
          );
        });

        it('returns a score containing only notes that were selected in the share string', () => {
          verifyScoreNoteGroupTypes(
            persistedAppState.scoreData,
            NoteGroupType.W,
            NoteGroupType.H,
            NoteGroupType.Q
          );
        });
      });

      describe('with a previous score setting state that matches the share string', () => {
        let noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap;
        let randomMeasures: Measure[];

        beforeEach(() => {
          noteGroupTypeSelectionMap = setNoteGroupTypeSelections(
            getNoteGroupTypeSelectionMap(4),
            NoteGroupType.W,
            NoteGroupType.H,
            NoteGroupType.Q
          );
          randomMeasures = getRandomMeasures(noteGroupTypeSelectionMap, 4, 4);
          setupLocalStorageScoreSettings(
            noteGroupTypeSelectionMap,
            4,
            TimeSignatureType.SIMPLE_4_4,
            120,
            { pitchClass: PitchClass.C, octave: Octave._3 }
          );
          setupLocalStorageScoreData(
            randomMeasures,
            TimeSignatureType.SIMPLE_4_4
          );

          persistedAppState = getPersistedAppState('04212033000102');
        });

        it('uses the persisted measure count', () => {
          expect(persistedAppState.scoreSettings.measureCount).toEqual(4);
        });

        it('uses the persisted time signature', () => {
          expect(persistedAppState.scoreSettings.timeSignatureType).toEqual(
            TimeSignatureType.SIMPLE_4_4
          );
        });

        it('uses the persisted note group type selection map', () => {
          expect(
            persistedAppState.scoreSettings.noteGroupTypeSelectionMap
          ).toEqual(noteGroupTypeSelectionMap);
        });

        it('uses the persisted tempo', () => {
          expect(persistedAppState.scoreSettings.tempo).toEqual(120);
        });

        it('uses the persisted pitch', () => {
          expect(persistedAppState.scoreSettings.pitch).toEqual({
            pitchClass: PitchClass.C,
            octave: Octave._3,
          });
        });

        it('uses the persisted score data', () => {
          expect(persistedAppState.scoreData).toMatchObject({
            timeSignature: filterIconProperty(
              getTimeSignature(TimeSignatureType.SIMPLE_4_4)
            ),
            measures: filterIconPropertyFromMeasures(randomMeasures),
          });
        });
      });

      describe('with a previous score setting state that does not match the share string', () => {
        let noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap;
        let randomMeasures: Measure[];

        beforeEach(() => {
          noteGroupTypeSelectionMap = setNoteGroupTypeSelections(
            getNoteGroupTypeSelectionMap(3),
            NoteGroupType.HR,
            NoteGroupType.QR
          );
          randomMeasures = getRandomMeasures(noteGroupTypeSelectionMap, 3, 2);
          setupLocalStorageScoreSettings(
            noteGroupTypeSelectionMap,
            2,
            TimeSignatureType.SIMPLE_3_4,
            80,
            { pitchClass: PitchClass.F, octave: Octave._3 }
          );
          setupLocalStorageScoreData(
            randomMeasures,
            TimeSignatureType.SIMPLE_3_4
          );

          persistedAppState = getPersistedAppState('14212033000102');
        });

        it('uses the measure count from the share string', () => {
          expect(persistedAppState.scoreSettings.measureCount).toEqual(4);
        });

        it('uses the time signature from the share string', () => {
          expect(persistedAppState.scoreSettings.timeSignatureType).toEqual(
            TimeSignatureType.SIMPLE_4_4
          );
        });

        it('uses the note group type selection map from the share string', () => {
          expect(
            persistedAppState.scoreSettings.noteGroupTypeSelectionMap
          ).toEqual(
            setNoteGroupTypeSelections(
              getNoteGroupTypeSelectionMap(4),
              NoteGroupType.W,
              NoteGroupType.H,
              NoteGroupType.Q
            )
          );
        });

        it('uses the tempo from the share string', () => {
          expect(persistedAppState.scoreSettings.tempo).toEqual(120);
        });

        it('uses the pitch from the share string', () => {
          expect(persistedAppState.scoreSettings.pitch).toEqual({
            pitchClass: PitchClass.C,
            octave: Octave._3,
          });
        });

        it('uses the score time signature from the share string', () => {
          expect(persistedAppState.scoreData.timeSignature.type).toEqual(
            TimeSignatureType.SIMPLE_4_4
          );
        });

        it('does not use the persisted score data measures', () => {
          expect(persistedAppState.scoreData.measures).not.toEqual(
            randomMeasures
          );
        });

        it('returns a score containing only notes that were selected in the share string', () => {
          verifyScoreNoteGroupTypes(
            persistedAppState.scoreData,
            NoteGroupType.W,
            NoteGroupType.H,
            NoteGroupType.Q
          );
        });
      });
    });

    describe('with an invalid share string query parameter', () => {
      describe('with no previous state', () => {
        beforeEach(() => {
          persistedAppState = getPersistedAppState('foobar');
        });

        it('returns an error message informing the user that the share link is invalid, and default settings were applied', () => {
          expect(persistedAppState.errorMessage).toEqual(
            'This share link is not valid. Default settings have been applied.'
          );
        });
      });

      describe('with a previous state', () => {
        let noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap;
        let randomMeasures: Measure[];

        beforeEach(() => {
          noteGroupTypeSelectionMap = getNoteGroupTypeSelectionMap(3);
          randomMeasures = getRandomMeasures(noteGroupTypeSelectionMap, 2, 4);
          setupLocalStorageScoreSettings(
            noteGroupTypeSelectionMap,
            4,
            TimeSignatureType.SIMPLE_3_4,
            120,
            { pitchClass: PitchClass.C, octave: Octave._3 }
          );
          setupLocalStorageScoreData(
            randomMeasures,
            TimeSignatureType.SIMPLE_3_4
          );

          persistedAppState = getPersistedAppState('foobar');
        });

        it('returns an error message stating that the link is not valid and that previous settings have been applied', () => {
          expect(persistedAppState.errorMessage).toEqual(
            'This share link is not valid. Your previous settings have been applied.'
          );
        });

        it('returns the previously saved measure count', () => {
          expect(persistedAppState.scoreSettings.measureCount).toEqual(4);
        });

        it('returns the previously-saved time signature type', () => {
          expect(persistedAppState.scoreSettings.timeSignatureType).toEqual(
            TimeSignatureType.SIMPLE_3_4
          );
        });

        it('returns the previously-saved note group type selection map', () => {
          expect(
            persistedAppState.scoreSettings.noteGroupTypeSelectionMap
          ).toEqual(noteGroupTypeSelectionMap);
        });

        it('returns the previously-saved tempo', () => {
          expect(persistedAppState.scoreSettings.tempo).toEqual(120);
        });

        it('returns the previously-saved pitch', () => {
          expect(persistedAppState.scoreSettings.pitch).toEqual({
            pitchClass: PitchClass.C,
            octave: Octave._3,
          });
        });

        it('returns score data with the previously-used time signature', () => {
          expect(persistedAppState.scoreData.timeSignature).toMatchObject(
            filterIconProperty(getTimeSignature(TimeSignatureType.SIMPLE_3_4))
          );
        });

        it('returns score data with the previously-generated measures', () => {
          const filteredRandomMeasures = randomMeasures.map((measure) => {
            return {
              ...measure,
              noteGroups: measure.noteGroups.map(filterIconProperty),
            };
          });
          expect(persistedAppState.scoreData.measures).toMatchObject(
            filteredRandomMeasures
          );
        });
      });
    });
  });

  describe('persistAppState() function', () => {
    let noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap;
    let randomMeasures: Measure[];

    beforeEach(() => {
      noteGroupTypeSelectionMap = getNoteGroupTypeSelectionMap(3);
      randomMeasures = getRandomMeasures(noteGroupTypeSelectionMap, 3, 2);

      persistAppState({
        scoreSettings: {
          measureCount: 2,
          timeSignatureType: TimeSignatureType.SIMPLE_3_4,
          noteGroupTypeSelectionMap,
          tempo: 120,
          pitch: { pitchClass: PitchClass.F, octave: Octave._3 },
        },
        scoreData: {
          timeSignature: getTimeSignature(TimeSignatureType.SIMPLE_3_4),
          measures: randomMeasures,
        },
      });
    });

    it('calls localStorage.setItem for the score settings', () => {
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'rr.scoreSettings',
        JSON.stringify({
          measureCount: 2,
          timeSignatureType: TimeSignatureType.SIMPLE_3_4,
          noteGroupTypeSelectionMap: noteGroupTypeSelectionMap,
          tempo: 120,
          pitch: { pitchClass: PitchClass.F, octave: Octave._3 },
        })
      );
    });

    it('calls localStorage.setItem for the score data', () => {
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'rr.scoreData',
        JSON.stringify({
          timeSignature: getTimeSignature(TimeSignatureType.SIMPLE_3_4),
          measures: randomMeasures,
        })
      );
    });
  });
});
