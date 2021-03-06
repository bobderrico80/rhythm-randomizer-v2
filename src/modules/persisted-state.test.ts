import {
  DEFAULT_METRONOME_SETTINGS,
  DEFAULT_PITCH,
  DEFAULT_TEMPO,
} from '../App';
import { MetronomeSettings } from './metronome';
import {
  getNoteGroupTypeSelectionMap,
  setNoteGroupTypeSelections,
} from './note';
import {
  NoteGroupType,
  NoteGroupTypeSelectionMap,
  Octave,
  Pitch,
  PitchClass,
} from './note-definition';
import {
  getPersistedAppState,
  persistAppState,
  PersistedAppState,
} from './persisted-state';
import { getRandomMeasures } from './random';
import { ScoreData } from './score';
import {
  getTimeSignature,
  TimeSignature,
  TimeSignatureType,
} from './time-signature';
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
  pitch?: Pitch,
  metronomeSettings?: MetronomeSettings
) => {
  localStorage.setItem(
    'rr.scoreSettings',
    JSON.stringify({
      measureCount,
      timeSignatureType,
      noteGroupTypeSelectionMap,
      tempo,
      pitch,
      metronomeSettings,
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
      let timeSignatureType: TimeSignatureType;

      beforeEach(() => {
        noteGroupTypeSelectionMap = getNoteGroupTypeSelectionMap();
        timeSignatureType = TimeSignatureType.SIMPLE_3_4;
        randomMeasures = getRandomMeasures(
          noteGroupTypeSelectionMap,
          getTimeSignature(timeSignatureType),
          4
        );
        setupLocalStorageScoreSettings(
          noteGroupTypeSelectionMap,
          4,
          timeSignatureType,
          120,
          { pitchClass: PitchClass.Bb, octave: Octave._4 },
          {
            active: true,
            subdivisionClick: false,
            startOfMeasureClick: true,
            countOffMeasures: 0,
          }
        );
        setupLocalStorageScoreData(randomMeasures, timeSignatureType);

        persistedAppState = getPersistedAppState();
      });

      it('returns expected measure count', () => {
        expect(persistedAppState.scoreSettings.measureCount).toEqual(4);
      });

      it('returns expected time signature type', () => {
        expect(persistedAppState.scoreSettings.timeSignature.type).toEqual(
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

      it('returns expected metronome settings', () => {
        expect(persistedAppState.scoreSettings.metronomeSettings).toEqual({
          active: true,
          subdivisionClick: false,
          startOfMeasureClick: true,
          countOffMeasures: 0,
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
      let timeSignatureType: TimeSignatureType;

      beforeEach(() => {
        noteGroupTypeSelectionMap = getNoteGroupTypeSelectionMap();
        timeSignatureType = TimeSignatureType.SIMPLE_3_4;
        randomMeasures = getRandomMeasures(
          noteGroupTypeSelectionMap,
          getTimeSignature(timeSignatureType),
          4
        );
        setupLocalStorageScoreSettings(
          noteGroupTypeSelectionMap,
          4,
          timeSignatureType
        );
        setupLocalStorageScoreData(randomMeasures, timeSignatureType);

        persistedAppState = getPersistedAppState();
      });

      it('returns expected measure count', () => {
        expect(persistedAppState.scoreSettings.measureCount).toEqual(4);
      });

      it('returns expected time signature type', () => {
        expect(persistedAppState.scoreSettings.timeSignature.type).toEqual(
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

    describe('with previous persisted state that does not include metronome settings information', () => {
      let noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap;
      let randomMeasures: Measure[];
      let timeSignatureType: TimeSignatureType;

      beforeEach(() => {
        noteGroupTypeSelectionMap = getNoteGroupTypeSelectionMap();
        timeSignatureType = TimeSignatureType.SIMPLE_3_4;
        randomMeasures = getRandomMeasures(
          noteGroupTypeSelectionMap,
          getTimeSignature(timeSignatureType),
          4
        );
        setupLocalStorageScoreSettings(
          noteGroupTypeSelectionMap,
          4,
          timeSignatureType,
          120,
          { pitchClass: PitchClass.Bb, octave: Octave._4 }
        );
        setupLocalStorageScoreData(randomMeasures, timeSignatureType);

        persistedAppState = getPersistedAppState();
      });

      it('returns expected measure count', () => {
        expect(persistedAppState.scoreSettings.measureCount).toEqual(4);
      });

      it('returns expected time signature type', () => {
        expect(persistedAppState.scoreSettings.timeSignature.type).toEqual(
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

      it('returns the default metronome settings', () => {
        expect(persistedAppState.scoreSettings.metronomeSettings).toEqual(
          DEFAULT_METRONOME_SETTINGS
        );
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
              getNoteGroupTypeSelectionMap(),
              4,
              TimeSignatureType.SIMPLE_3_4
            );
          },
        },
        {
          description: 'with persisted score data, but no score settings',
          setup: () => {
            setupLocalStorageScoreData(
              getRandomMeasures(
                getNoteGroupTypeSelectionMap(),
                getTimeSignature(TimeSignatureType.SIMPLE_3_4),
                4
              ),
              TimeSignatureType.SIMPLE_3_4
            );
          },
        },
        {
          description:
            'with persisted settings and score data with empty measures',
          setup: () => {
            const noteGroupTypeSelectionMap = getNoteGroupTypeSelectionMap();
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
            expect(persistedAppState.scoreSettings.timeSignature.type).toEqual(
              TimeSignatureType.SIMPLE_4_4
            );
          });

          it('returns the default note group type selection map', () => {
            expect(
              persistedAppState.scoreSettings.noteGroupTypeSelectionMap
            ).toEqual(getNoteGroupTypeSelectionMap());
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

          it('returns the default metronome settings', () => {
            expect(persistedAppState.scoreSettings.metronomeSettings).toEqual(
              DEFAULT_METRONOME_SETTINGS
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
          persistedAppState = getPersistedAppState('2421203303000102');
        });

        it('returns the expected measure count from the share string', () => {
          expect(persistedAppState.scoreSettings.measureCount).toEqual(4);
        });

        it('returns the expected time signature', () => {
          expect(persistedAppState.scoreSettings.timeSignature.type).toEqual(
            TimeSignatureType.SIMPLE_4_4
          );
        });

        it('returns the expected selected notes', () => {
          const expectedNoteGroupTypeSelectionMap = setNoteGroupTypeSelections(
            getNoteGroupTypeSelectionMap(),
            false,
            NoteGroupType.W,
            NoteGroupType.H,
            NoteGroupType.Q
          )
            .set(NoteGroupType.EE, false)
            .set(NoteGroupType.SSSS, false)
            .set(NoteGroupType.QR, false)
            .set(NoteGroupType.HR, false)
            .set(NoteGroupType.WR, false);
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

        it('returns the expected metronome settings', () => {
          expect(persistedAppState.scoreSettings.metronomeSettings).toEqual({
            countOffMeasures: 0,
            active: true,
            subdivisionClick: false,
            startOfMeasureClick: true,
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
        let timeSignatureType: TimeSignatureType;
        let randomMeasures: Measure[];

        beforeEach(() => {
          noteGroupTypeSelectionMap = setNoteGroupTypeSelections(
            getNoteGroupTypeSelectionMap(),
            true,
            NoteGroupType.W,
            NoteGroupType.H,
            NoteGroupType.Q
          );
          timeSignatureType = TimeSignatureType.SIMPLE_4_4;
          randomMeasures = getRandomMeasures(
            noteGroupTypeSelectionMap,
            getTimeSignature(timeSignatureType),
            4
          );
          setupLocalStorageScoreSettings(
            noteGroupTypeSelectionMap,
            4,
            timeSignatureType,
            120,
            { pitchClass: PitchClass.C, octave: Octave._3 },
            {
              active: true,
              subdivisionClick: false,
              startOfMeasureClick: true,
              countOffMeasures: 0,
            }
          );
          setupLocalStorageScoreData(randomMeasures, timeSignatureType);

          persistedAppState = getPersistedAppState('04212033000102');
        });

        it('uses the persisted measure count', () => {
          expect(persistedAppState.scoreSettings.measureCount).toEqual(4);
        });

        it('uses the persisted time signature', () => {
          expect(persistedAppState.scoreSettings.timeSignature.type).toEqual(
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

        it('uses the persisted metronome settings', () => {
          expect(persistedAppState.scoreSettings.metronomeSettings).toEqual({
            countOffMeasures: 0,
            active: true,
            subdivisionClick: false,
            startOfMeasureClick: true,
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
        let timeSignatureType: TimeSignatureType;
        let randomMeasures: Measure[];

        beforeEach(() => {
          noteGroupTypeSelectionMap = setNoteGroupTypeSelections(
            getNoteGroupTypeSelectionMap(),
            true,
            NoteGroupType.HR,
            NoteGroupType.QR
          );
          timeSignatureType = TimeSignatureType.SIMPLE_3_4;
          randomMeasures = getRandomMeasures(
            noteGroupTypeSelectionMap,
            getTimeSignature(timeSignatureType),
            2
          );
          setupLocalStorageScoreSettings(
            noteGroupTypeSelectionMap,
            2,
            timeSignatureType,
            80,
            { pitchClass: PitchClass.F, octave: Octave._3 },
            {
              active: true,
              subdivisionClick: false,
              startOfMeasureClick: true,
              countOffMeasures: 0,
            }
          );
          setupLocalStorageScoreData(randomMeasures, timeSignatureType);

          persistedAppState = getPersistedAppState('2421203313000102');
        });

        it('uses the measure count from the share string', () => {
          expect(persistedAppState.scoreSettings.measureCount).toEqual(4);
        });

        it('uses the time signature from the share string', () => {
          expect(persistedAppState.scoreSettings.timeSignature.type).toEqual(
            TimeSignatureType.SIMPLE_4_4
          );
        });

        it('uses the note group type selection map from the share string', () => {
          expect(
            persistedAppState.scoreSettings.noteGroupTypeSelectionMap
          ).toEqual(
            setNoteGroupTypeSelections(
              getNoteGroupTypeSelectionMap(),
              true,
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

        it('uses the metronome settings from the share string', () => {
          expect(persistedAppState.scoreSettings.metronomeSettings).toEqual({
            countOffMeasures: 1,
            active: true,
            subdivisionClick: false,
            startOfMeasureClick: true,
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

        it('does not change persisted note group selections that are not valid for the shared time signature value', () => {
          noteGroupTypeSelectionMap = setNoteGroupTypeSelections(
            getNoteGroupTypeSelectionMap(),
            true,
            NoteGroupType.W,
            NoteGroupType.CWD
          );
          timeSignatureType = TimeSignatureType.SIMPLE_4_4;
          randomMeasures = getRandomMeasures(
            noteGroupTypeSelectionMap,
            getTimeSignature(timeSignatureType),
            2
          );
          setupLocalStorageScoreSettings(
            noteGroupTypeSelectionMap,
            2,
            timeSignatureType,
            80,
            { pitchClass: PitchClass.F, octave: Octave._3 }
          );
          setupLocalStorageScoreData(randomMeasures, timeSignatureType);

          persistedAppState = getPersistedAppState('14212033000102');

          // Should not set the compound note group to false, even though it isn't in the share string
          expect(
            persistedAppState.scoreSettings.noteGroupTypeSelectionMap.get(
              NoteGroupType.CWD
            )
          ).toEqual(true);
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
        let timeSignatureType: TimeSignatureType;
        let randomMeasures: Measure[];

        beforeEach(() => {
          noteGroupTypeSelectionMap = getNoteGroupTypeSelectionMap();
          timeSignatureType = TimeSignatureType.SIMPLE_3_4;
          randomMeasures = getRandomMeasures(
            noteGroupTypeSelectionMap,
            getTimeSignature(timeSignatureType),
            4
          );
          setupLocalStorageScoreSettings(
            noteGroupTypeSelectionMap,
            4,
            timeSignatureType,
            120,
            { pitchClass: PitchClass.C, octave: Octave._3 },
            {
              active: true,
              subdivisionClick: false,
              startOfMeasureClick: true,
              countOffMeasures: 0,
            }
          );
          setupLocalStorageScoreData(randomMeasures, timeSignatureType);

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
          expect(persistedAppState.scoreSettings.timeSignature.type).toEqual(
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

        it('return the previously-saved metronome settings', () => {
          expect(persistedAppState.scoreSettings.metronomeSettings).toEqual({
            countOffMeasures: 0,
            active: true,
            subdivisionClick: false,
            startOfMeasureClick: true,
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
    let timeSignature: TimeSignature;
    let randomMeasures: Measure[];

    beforeEach(() => {
      noteGroupTypeSelectionMap = getNoteGroupTypeSelectionMap();
      timeSignature = getTimeSignature(TimeSignatureType.SIMPLE_3_4);
      randomMeasures = getRandomMeasures(
        noteGroupTypeSelectionMap,
        timeSignature,
        2
      );

      persistAppState({
        scoreSettings: {
          measureCount: 2,
          timeSignature,
          noteGroupTypeSelectionMap,
          tempo: 120,
          pitch: { pitchClass: PitchClass.F, octave: Octave._3 },
          metronomeSettings: DEFAULT_METRONOME_SETTINGS,
        },
        scoreData: {
          timeSignature,
          measures: randomMeasures,
        },
      });
    });

    it('calls localStorage.setItem for the score settings', () => {
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'rr.scoreSettings',
        JSON.stringify({
          measureCount: 2,
          timeSignature,
          noteGroupTypeSelectionMap: noteGroupTypeSelectionMap,
          tempo: 120,
          pitch: { pitchClass: PitchClass.F, octave: Octave._3 },
          metronomeSettings: DEFAULT_METRONOME_SETTINGS,
        })
      );
    });

    it('calls localStorage.setItem for the score data', () => {
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'rr.scoreData',
        JSON.stringify({
          timeSignature,
          measures: randomMeasures,
        })
      );
    });
  });
});
