import {
  DEFAULT_METRONOME_SETTINGS,
  DEFAULT_PITCH,
  DEFAULT_TEMPO,
  ScoreSettings,
} from '../App';
import {
  getNoteGroupTypeSelectionMap,
  getSelectedNoteGroupTypes,
  NoteGroupType,
  NoteGroupTypeSelectionMap,
  resetNoteGroupTypeSelectionMap,
  Octave,
  PitchClass,
} from './note';
import {
  decodeScoreSettingsShareString,
  encodeScoreSettingsShareString,
  ShareStringEncodingVersion,
} from './share';
import { getTimeSignature, TimeSignatureType } from './time-signature';

describe('The share module', () => {
  describe('encodeScoreSettingsShareString() function', () => {
    describe('with a version 0 share string', () => {
      let noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap;
      let scoreSettings: ScoreSettings;
      let shareString: string;

      beforeEach(() => {
        noteGroupTypeSelectionMap = getNoteGroupTypeSelectionMap().set(
          NoteGroupType.TEEE,
          true
        );

        scoreSettings = {
          measureCount: 4,
          timeSignature: getTimeSignature(TimeSignatureType.SIMPLE_4_4),
          noteGroupTypeSelectionMap,
          tempo: DEFAULT_TEMPO,
          pitch: DEFAULT_PITCH,
          metronomeSettings: DEFAULT_METRONOME_SETTINGS,
        };

        shareString = encodeScoreSettingsShareString(
          scoreSettings,
          ShareStringEncodingVersion._0
        );
      });

      it('returns the expected full share string', () => {
        expect(shareString).toEqual('04200010203040506070c');
      });

      it('contains the current version `0` as the first character', () => {
        expect(shareString.charAt(0)).toEqual('0');
      });

      it('contains the measure count at the second character', () => {
        expect(shareString.charAt(1)).toEqual('4');
      });

      it('contains the time signature index at the 3rd character', () => {
        expect(shareString.charAt(2)).toEqual('2');
      });

      it('contains a 8-bit hex code of the index of each selected note group in the note group type selection map', () => {
        expect(shareString.substring(3)).toEqual('00010203040506070c');
      });

      it('does not include selected invalid note groups for the current time signature', () => {
        noteGroupTypeSelectionMap = resetNoteGroupTypeSelectionMap(
          getNoteGroupTypeSelectionMap()
        )
          .set(NoteGroupType.W, true)
          .set(NoteGroupType.H, true)
          .set(NoteGroupType.CHD, true);

        scoreSettings = {
          measureCount: 4,
          timeSignature: getTimeSignature(TimeSignatureType.SIMPLE_3_4),
          noteGroupTypeSelectionMap,
          tempo: DEFAULT_TEMPO,
          pitch: DEFAULT_PITCH,
          metronomeSettings: DEFAULT_METRONOME_SETTINGS,
        };

        shareString = encodeScoreSettingsShareString(
          scoreSettings,
          ShareStringEncodingVersion._0
        );

        expect(shareString.substring(3)).toEqual('01');
      });
    });

    describe('with a version 1 share string', () => {
      let noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap;
      let scoreSettings: ScoreSettings;
      let shareString: string;

      beforeEach(() => {
        noteGroupTypeSelectionMap = getNoteGroupTypeSelectionMap().set(
          NoteGroupType.TEEE,
          true
        );

        scoreSettings = {
          measureCount: 4,
          timeSignature: getTimeSignature(TimeSignatureType.SIMPLE_4_4),
          noteGroupTypeSelectionMap,
          tempo: 80,
          pitch: { pitchClass: PitchClass.Bb, octave: Octave._4 },
          metronomeSettings: DEFAULT_METRONOME_SETTINGS,
        };

        shareString = encodeScoreSettingsShareString(
          scoreSettings,
          ShareStringEncodingVersion._1
        );
      });

      it('returns the expected full share string', () => {
        expect(shareString).toEqual('1420801400010203040506070c');
      });

      it('contains the current version `1` as the first character', () => {
        expect(shareString.charAt(0)).toEqual('1');
      });

      it('contains the measure count at the second character', () => {
        expect(shareString.charAt(1)).toEqual('4');
      });

      it('contains the time signature index at the 3rd character', () => {
        expect(shareString.charAt(2)).toEqual('2');
      });

      it('contains the tempo in BPM in the 4th, 5th, and 6th characters', () => {
        expect(shareString.substr(3, 3)).toEqual('080');
      });

      it('contains the pitch class index at the 7th character', () => {
        expect(shareString.charAt(6)).toEqual('1');
      });

      it('contains the pitch octave index at the 8th character', () => {
        expect(shareString.charAt(7)).toEqual('4');
      });

      it('contains a 8-bit hex code of the index of each selected note group in the note group type selection map for the remaining characters', () => {
        expect(shareString.substring(8)).toEqual('00010203040506070c');
      });

      it('does not include selected invalid note groups for the current time signature', () => {
        noteGroupTypeSelectionMap = resetNoteGroupTypeSelectionMap(
          getNoteGroupTypeSelectionMap()
        )
          .set(NoteGroupType.W, true)
          .set(NoteGroupType.H, true)
          .set(NoteGroupType.CHD, true);

        scoreSettings = {
          measureCount: 4,
          timeSignature: getTimeSignature(TimeSignatureType.SIMPLE_3_4),
          noteGroupTypeSelectionMap,
          tempo: DEFAULT_TEMPO,
          pitch: DEFAULT_PITCH,
          metronomeSettings: DEFAULT_METRONOME_SETTINGS,
        };

        shareString = encodeScoreSettingsShareString(
          scoreSettings,
          ShareStringEncodingVersion._1
        );

        expect(shareString.substring(8)).toEqual('01');
      });
    });

    describe('with a version 2 share string', () => {
      let noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap;
      let scoreSettings: ScoreSettings;
      let shareString: string;

      beforeEach(() => {
        noteGroupTypeSelectionMap = getNoteGroupTypeSelectionMap().set(
          NoteGroupType.TEEE,
          true
        );

        scoreSettings = {
          measureCount: 4,
          timeSignature: getTimeSignature(TimeSignatureType.SIMPLE_4_4),
          noteGroupTypeSelectionMap,
          tempo: 80,
          pitch: { pitchClass: PitchClass.Bb, octave: Octave._4 },
          metronomeSettings: {
            countOffMeasures: 2,
            active: true,
            startOfMeasureClick: false,
            subdivisionClick: true,
          },
        };

        shareString = encodeScoreSettingsShareString(
          scoreSettings,
          ShareStringEncodingVersion._2
        );
      });

      it('returns the expected full share string', () => {
        expect(shareString).toEqual('242080142500010203040506070c');
      });

      it('contains the current version `2` as the first character', () => {
        expect(shareString.charAt(0)).toEqual('2');
      });

      it('contains the measure count at the second character', () => {
        expect(shareString.charAt(1)).toEqual('4');
      });

      it('contains the time signature index at the 3rd character', () => {
        expect(shareString.charAt(2)).toEqual('2');
      });

      it('contains the tempo in BPM in the 4th, 5th, and 6th characters', () => {
        expect(shareString.substr(3, 3)).toEqual('080');
      });

      it('contains the pitch class index at the 7th character', () => {
        expect(shareString.charAt(6)).toEqual('1');
      });

      it('contains the pitch octave index at the 8th character', () => {
        expect(shareString.charAt(7)).toEqual('4');
      });

      it('contains the metronome count-off value at the 9th character', () => {
        expect(shareString.charAt(8)).toEqual('2');
      });

      it('contains hexadecimal value, representing the boolean metronome settings (active, start of measure click, subdivision click) at the 10th character', () => {
        expect(shareString.charAt(9)).toEqual('5');
      });

      it('contains a 8-bit hex code of the index of each selected note group in the note group type selection map for the remaining characters', () => {
        expect(shareString.substring(10)).toEqual('00010203040506070c');
      });

      it('does not include selected invalid note groups for the current time signature', () => {
        noteGroupTypeSelectionMap = resetNoteGroupTypeSelectionMap(
          getNoteGroupTypeSelectionMap()
        )
          .set(NoteGroupType.W, true)
          .set(NoteGroupType.H, true)
          .set(NoteGroupType.CHD, true);

        scoreSettings = {
          measureCount: 4,
          timeSignature: getTimeSignature(TimeSignatureType.SIMPLE_3_4),
          noteGroupTypeSelectionMap,
          tempo: DEFAULT_TEMPO,
          pitch: DEFAULT_PITCH,
          metronomeSettings: DEFAULT_METRONOME_SETTINGS,
        };

        shareString = encodeScoreSettingsShareString(
          scoreSettings,
          ShareStringEncodingVersion._1
        );

        expect(shareString.substring(8)).toEqual('01');
      });
    });
  });

  describe('decodeSettingsShareString() function', () => {
    describe('with a valid version 0 share string', () => {
      let scoreSettings: ScoreSettings;

      beforeEach(() => {
        scoreSettings = decodeScoreSettingsShareString('04200010203040506070c');
      });

      it('parses the correct measure count', () => {
        expect(scoreSettings.measureCount).toEqual(4);
      });

      it('parses the correct time signature type', () => {
        expect(scoreSettings.timeSignature).toEqual(
          getTimeSignature(TimeSignatureType.SIMPLE_4_4)
        );
      });

      it('parses the correct selected note groups', () => {
        expect(
          getSelectedNoteGroupTypes(
            scoreSettings.noteGroupTypeSelectionMap,
            getTimeSignature(TimeSignatureType.SIMPLE_4_4)
          )
        ).toEqual([
          NoteGroupType.EE,
          NoteGroupType.SSSS,
          NoteGroupType.QR,
          NoteGroupType.H,
          NoteGroupType.HR,
          NoteGroupType.Q,
          NoteGroupType.TEEE,
          NoteGroupType.W,
          NoteGroupType.WR,
        ]);
      });

      it('returns the default tempo', () => {
        expect(scoreSettings.tempo).toEqual(DEFAULT_TEMPO);
      });

      it('returns the default pitch', () => {
        expect(scoreSettings.pitch).toEqual(DEFAULT_PITCH);
      });
    });

    describe('with a valid version 1 share string', () => {
      let scoreSettings: ScoreSettings;

      beforeEach(() => {
        scoreSettings = decodeScoreSettingsShareString(
          '1421203300010203040506070c'
        );
      });

      it('parses the correct measure count', () => {
        expect(scoreSettings.measureCount).toEqual(4);
      });

      it('parses the correct time signature type', () => {
        expect(scoreSettings.timeSignature).toEqual(
          getTimeSignature(TimeSignatureType.SIMPLE_4_4)
        );
      });

      it('parses the correct selected note groups', () => {
        expect(
          getSelectedNoteGroupTypes(
            scoreSettings.noteGroupTypeSelectionMap,
            getTimeSignature(TimeSignatureType.SIMPLE_4_4)
          )
        ).toEqual([
          NoteGroupType.EE,
          NoteGroupType.SSSS,
          NoteGroupType.QR,
          NoteGroupType.H,
          NoteGroupType.HR,
          NoteGroupType.Q,
          NoteGroupType.TEEE,
          NoteGroupType.W,
          NoteGroupType.WR,
        ]);
      });

      it('parses the correct tempo', () => {
        expect(scoreSettings.tempo).toEqual(120);
      });

      it('parses the correct pitch class', () => {
        expect(scoreSettings.pitch.pitchClass).toEqual(PitchClass.C);
      });

      it('parses the correct octave', () => {
        expect(scoreSettings.pitch.octave).toEqual(Octave._3);
      });
    });

    describe('with a valid version 2 share string', () => {
      let scoreSettings: ScoreSettings;

      beforeEach(() => {
        scoreSettings = decodeScoreSettingsShareString(
          '242120331300010203040506070c'
        );
      });

      it('parses the correct measure count', () => {
        expect(scoreSettings.measureCount).toEqual(4);
      });

      it('parses the correct time signature type', () => {
        expect(scoreSettings.timeSignature).toEqual(
          getTimeSignature(TimeSignatureType.SIMPLE_4_4)
        );
      });

      it('parses the correct selected note groups', () => {
        expect(
          getSelectedNoteGroupTypes(
            scoreSettings.noteGroupTypeSelectionMap,
            getTimeSignature(TimeSignatureType.SIMPLE_4_4)
          )
        ).toEqual([
          NoteGroupType.EE,
          NoteGroupType.SSSS,
          NoteGroupType.QR,
          NoteGroupType.H,
          NoteGroupType.HR,
          NoteGroupType.Q,
          NoteGroupType.TEEE,
          NoteGroupType.W,
          NoteGroupType.WR,
        ]);
      });

      it('parses the correct tempo', () => {
        expect(scoreSettings.tempo).toEqual(120);
      });

      it('parses the correct pitch class', () => {
        expect(scoreSettings.pitch.pitchClass).toEqual(PitchClass.C);
      });

      it('parses the correct octave', () => {
        expect(scoreSettings.pitch.octave).toEqual(Octave._3);
      });

      it('parses the correct metronome count-off settings', () => {
        expect(scoreSettings.metronomeSettings.countOffMeasures).toEqual(1);
      });

      it('parses the correct metronome subdivision click setting', () => {
        expect(scoreSettings.metronomeSettings.subdivisionClick).toEqual(false);
      });

      it('parses the correct metronome start of measure click setting', () => {
        expect(scoreSettings.metronomeSettings.startOfMeasureClick).toEqual(
          true
        );
      });

      it('parses the correct metronome active setting', () => {
        expect(scoreSettings.metronomeSettings.active).toEqual(true);
      });
    });

    describe('with invalid version 0 share strings', () => {
      const testCases = [
        {
          description: 'where the share string is too short',
          shareString: '042',
        },
        {
          description: 'where the share string is not a valid version',
          shareString: '34200',
        },
        {
          description: 'where the measure count value is not a valid selection',
          shareString: '03200',
        },
        {
          description:
            'where the measure count cannot be parsed as a decimal string',
          shareString: '0a200',
        },
        {
          description: 'where the time signature is not a valid selection',
          shareString: '04900',
        },
        {
          description:
            'where the time signature cannot be parsed as a decimal number',
          shareString: '04a00',
        },
        {
          description:
            'where there is an odd number of note group index characters',
          shareString: '042000',
        },
        {
          description:
            'where a note group index cannot be parsed as a hexadecimal number',
          shareString: '04200zz',
        },
        {
          description: 'where a note group index is not a valid selection',
          shareString: '04200ff',
        },
      ];

      testCases.forEach(({ description, shareString }) => {
        describe(description, () => {
          it('throws the expected error', () => {
            expect(() => {
              decodeScoreSettingsShareString(shareString);
            }).toThrowError(new Error('Cannot decode share string'));
          });
        });
      });
    });

    describe('with invalid version 1 share strings', () => {
      const testCases = [
        {
          description: 'where the share string is too short',
          shareString: '142120',
        },
        {
          description: 'where the share string is not a valid version',
          shareString: '3421203300',
        },
        {
          description: 'where the measure count value is not a valid selection',
          shareString: '1321203300',
        },
        {
          description:
            'where the measure count cannot be parsed as a decimal string',
          shareString: '1a21203300',
        },
        {
          description: 'where the time signature is not a valid selection',
          shareString: '1491203300',
        },
        {
          description:
            'where the time signature cannot be parsed as a decimal number',
          shareString: '14a1203300',
        },
        {
          description:
            'where there is an odd number of note group index characters',
          shareString: '14212033000',
        },
        {
          description:
            'where a note group index cannot be parsed as a hexadecimal number',
          shareString: '1421203300zz',
        },
        {
          description: 'where a note group index is not a valid selection',
          shareString: '1421203300ff',
        },
        {
          description: 'where the tempo cannot be parsed as a decimal number',
          shareString: '14212a3300',
        },
        {
          description: 'where the tempo is lower than the expected range',
          shareString: '1420393300',
        },
        {
          description: 'where the tempo is higher than the expected range',
          shareString: '1423013300',
        },
        {
          description:
            'where the pitch class index cannot be parsed as a hexadecimal number',
          shareString: '142120z300',
        },
        {
          description: 'where the pitch class is not a valid selection',
          shareString: '142120c300',
        },
        {
          description:
            'where the pitch octave index cannot be parsed as a decimal number',
          shareString: '1421203a00',
        },
        {
          description: 'where the pitch octave is not a valid selection',
          shareString: '1421203800',
        },
      ];

      testCases.forEach(({ description, shareString }) => {
        describe(description, () => {
          it('throws the expected error', () => {
            expect(() => {
              decodeScoreSettingsShareString(shareString);
            }).toThrowError(new Error('Cannot decode share string'));
          });
        });
      });
    });

    describe('with invalid version 2 share strings', () => {
      const testCases = [
        {
          description: 'where the share string is too short',
          shareString: '24212033',
        },
        {
          description: 'where the share string is not a valid version',
          shareString: '342120331200',
        },
        {
          description: 'where the measure count value is not a valid selection',
          shareString: '232120331200',
        },
        {
          description:
            'where the measure count cannot be parsed as a decimal string',
          shareString: '2a2120331200',
        },
        {
          description: 'where the time signature is not a valid selection',
          shareString: '249120331200',
        },
        {
          description:
            'where the time signature cannot be parsed as a decimal number',
          shareString: '24a120331200',
        },
        {
          description:
            'where there is an odd number of note group index characters',
          shareString: '2421203312000',
        },
        {
          description:
            'where a note group index cannot be parsed as a hexadecimal number',
          shareString: '242120331200zz',
        },
        {
          description: 'where a note group index is not a valid selection',
          shareString: '242120331200ff',
        },
        {
          description: 'where the tempo cannot be parsed as a decimal number',
          shareString: '24212a331200',
        },
        {
          description: 'where the tempo is lower than the expected range',
          shareString: '242039331200',
        },
        {
          description: 'where the tempo is higher than the expected range',
          shareString: '242301331200',
        },
        {
          description:
            'where the pitch class index cannot be parsed as a hexadecimal number',
          shareString: '242120z31200',
        },
        {
          description: 'where the pitch class is not a valid selection',
          shareString: '242120c31200',
        },
        {
          description:
            'where the pitch octave index cannot be parsed as a decimal number',
          shareString: '2421203a1200',
        },
        {
          description: 'where the pitch octave is not a valid selection',
          shareString: '242120381200',
        },
        {
          description:
            'where the metronome count-off setting cannot be parsed as a hexadecimal number',
          shareString: '24212033z200',
        },
        {
          description:
            'where the metronome count-off setting is not a valid selection',
          shareString: '242120333200',
        },
        {
          description:
            'where the metronome boolean settings setting cannot be parsed as a hexadecimal number',
          shareString: '242120331z00',
        },
      ];

      testCases.forEach(({ description, shareString }) => {
        describe(description, () => {
          it('throws the expected error', () => {
            expect(() => {
              decodeScoreSettingsShareString(shareString);
            }).toThrowError(new Error('Cannot decode share string'));
          });
        });
      });
    });
  });
});
