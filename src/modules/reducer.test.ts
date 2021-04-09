import { DEFAULT_PITCH, DEFAULT_SCORE_SETTINGS } from '../App';
import { MultiSelectStatusType } from '../components/NoteCheckboxGroup';
import { getNoteGroupCategory } from './note';
import { NoteGroupCategoryType, NoteGroupType } from './note-definition';
import { Action, ActionType, reducer, State } from './reducer';

describe('The reducer module', () => {
  describe('reducer() function', () => {
    let state: State;

    beforeEach(() => {
      state = {
        scoreSettings: DEFAULT_SCORE_SETTINGS,
      };
    });

    describe('with UPDATE_SCORE_SETTINGS action type', () => {
      let action: Action;
      let newState: State;

      beforeEach(() => {
        action = {
          type: ActionType.UPDATE_SCORE_SETTINGS,
          scoreSettingsToUpdate: { measureCount: 8, tempo: 200 },
        };

        newState = reducer(state, action);
      });

      it('updates the provided scoreSettings properties', () => {
        expect(newState.scoreSettings.tempo).toEqual(200);
        expect(newState.scoreSettings.measureCount).toEqual(8);
      });

      it('does not update properties that were not provided', () => {
        expect(newState.scoreSettings.pitch).toEqual(DEFAULT_PITCH);
      });
    });

    describe('with SET_NOTE_GROUP_SELECTION action type', () => {
      let state: State;
      let action: Action;
      let newState: State;

      beforeEach(() => {
        state = {
          scoreSettings: DEFAULT_SCORE_SETTINGS,
        };
        action = {
          type: ActionType.SET_NOTE_GROUP_SELECTION,
          noteGroupType: NoteGroupType.Q,
          value: false,
        };

        newState = reducer(state, action);
      });

      it('updates the provided noteGroupType to the expected value', () => {
        expect(
          newState.scoreSettings.noteGroupTypeSelectionMap.get(NoteGroupType.Q)
        ).toEqual(false);
      });

      it('does not update other note group types', () => {
        expect(
          newState.scoreSettings.noteGroupTypeSelectionMap.get(NoteGroupType.H)
        ).toEqual(true);
      });
    });

    describe('with SET_NOTE_GROUP_SELECTIONS_FOR_CATEGORY', () => {
      let state: State;
      let action: Action;
      let newState: State;

      beforeEach(() => {
        state = {
          scoreSettings: DEFAULT_SCORE_SETTINGS,
        };
      });

      it('sets all note groups in the category to `true` if MultiSelectStatusType is SELECT_ALL', () => {
        action = {
          type: ActionType.SET_NOTE_GROUP_SELECTIONS_FOR_CATEGORY,
          category: getNoteGroupCategory(NoteGroupCategoryType.TUPLETS),
          multiSelectStatusType: MultiSelectStatusType.SELECT_ALL,
        };

        newState = reducer(state, action);

        expect(
          newState.scoreSettings.noteGroupTypeSelectionMap.get(
            NoteGroupType.TEEE
          )
        ).toEqual(true);
        expect(
          newState.scoreSettings.noteGroupTypeSelectionMap.get(
            NoteGroupType.TQQQ
          )
        ).toEqual(true);
      });

      it('sets all note groups in the category to `false` if MultiSelectStatusType is SELECT_NONE', () => {
        action = {
          type: ActionType.SET_NOTE_GROUP_SELECTIONS_FOR_CATEGORY,
          category: getNoteGroupCategory(NoteGroupCategoryType.BASIC_NOTES),
          multiSelectStatusType: MultiSelectStatusType.SELECT_NONE,
        };

        newState = reducer(state, action);

        expect(
          newState.scoreSettings.noteGroupTypeSelectionMap.get(NoteGroupType.Q)
        ).toEqual(false);
        expect(
          newState.scoreSettings.noteGroupTypeSelectionMap.get(NoteGroupType.H)
        ).toEqual(false);

        expect(
          newState.scoreSettings.noteGroupTypeSelectionMap.get(NoteGroupType.W)
        ).toEqual(false);
      });

      it('does not affect notes in different categories', () => {
        action = {
          type: ActionType.SET_NOTE_GROUP_SELECTIONS_FOR_CATEGORY,
          category: getNoteGroupCategory(NoteGroupCategoryType.BASIC_NOTES),
          multiSelectStatusType: MultiSelectStatusType.SELECT_NONE,
        };

        newState = reducer(state, action);

        expect(
          newState.scoreSettings.noteGroupTypeSelectionMap.get(NoteGroupType.QR)
        ).toEqual(true);
      });
    });
  });
});
