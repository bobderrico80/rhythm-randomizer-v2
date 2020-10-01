import { ScoreSettings } from '../App';
import {
  getNoteGroupTypeSelectionMap,
  getSelectedNoteGroupTypes,
  NoteGroupType,
} from './note';
import {
  decodeScoreSettingsShareString,
  encodeScoreSettingsShareString,
} from './share';
import { TimeSignatureType } from './time-signature';

describe('The share module', () => {
  describe('encodeScoreSettingsShareString() function', () => {
    let noteGroupTypeSelectionMap = getNoteGroupTypeSelectionMap(4);
    noteGroupTypeSelectionMap = noteGroupTypeSelectionMap.set(
      NoteGroupType.TEEE,
      true
    );

    const scoreSettings: ScoreSettings = {
      measureCount: 4,
      timeSignatureType: TimeSignatureType.SIMPLE_4_4,
      noteGroupTypeSelectionMap,
    };

    let shareString: string;

    beforeEach(() => {
      shareString = encodeScoreSettingsShareString(scoreSettings);
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
  });

  describe('decodeSettingsShareString() function', () => {
    describe('with a valid share string', () => {
      let scoreSettings: ScoreSettings;

      beforeEach(() => {
        scoreSettings = decodeScoreSettingsShareString('04200010203040506070c');
      });

      it('parses the correct measure count', () => {
        expect(scoreSettings.measureCount).toEqual(4);
      });

      it('parses the correct time signature type', () => {
        expect(scoreSettings.timeSignatureType).toEqual(
          TimeSignatureType.SIMPLE_4_4
        );
      });

      it('parses the correct selected note groups', () => {
        expect(
          getSelectedNoteGroupTypes(scoreSettings.noteGroupTypeSelectionMap)
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
    });

    describe('with invalid share strings', () => {
      const testCases = [
        {
          description: 'where the share string is too short',
          shareString: '042',
        },
        {
          description: 'where the share string is not version 0',
          shareString: '14200',
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
          shareString: '04300',
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
  });
});
