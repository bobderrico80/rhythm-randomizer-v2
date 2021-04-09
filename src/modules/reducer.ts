import { ScoreSettings } from '../App';
import { MultiSelectStatusType } from '../components/NoteCheckboxGroup';
import { NoteGroupType, NoteGroupCategory } from './note-definition';
import { getNoteGroup } from './note';

export type State = {
  scoreSettings: ScoreSettings;
};

export enum ActionType {
  UPDATE_SCORE_SETTINGS,
  SET_NOTE_GROUP_SELECTION,
  SET_NOTE_GROUP_SELECTIONS_FOR_CATEGORY,
}

export type Action =
  | {
      type: ActionType.UPDATE_SCORE_SETTINGS;
      scoreSettingsToUpdate: Partial<ScoreSettings>;
    }
  | {
      type: ActionType.SET_NOTE_GROUP_SELECTION;
      noteGroupType: NoteGroupType;
      value: boolean;
    }
  | {
      type: ActionType.SET_NOTE_GROUP_SELECTIONS_FOR_CATEGORY;
      category: NoteGroupCategory;
      multiSelectStatusType: MultiSelectStatusType;
    };

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionType.UPDATE_SCORE_SETTINGS:
      return {
        ...state,
        scoreSettings: {
          ...state.scoreSettings,
          ...action.scoreSettingsToUpdate,
        },
      };

    case ActionType.SET_NOTE_GROUP_SELECTION:
      return {
        ...state,
        scoreSettings: {
          ...state.scoreSettings,
          noteGroupTypeSelectionMap: state.scoreSettings.noteGroupTypeSelectionMap.set(
            action.noteGroupType,
            action.value
          ),
        },
      };

    case ActionType.SET_NOTE_GROUP_SELECTIONS_FOR_CATEGORY:
      let nextNoteGroupTypeSelectionMap =
        state.scoreSettings.noteGroupTypeSelectionMap;

      nextNoteGroupTypeSelectionMap.forEach((_, noteGroupType) => {
        const noteGroup = getNoteGroup(noteGroupType);

        if (noteGroup.categoryType === action.category.type) {
          const checked =
            action.multiSelectStatusType === MultiSelectStatusType.SELECT_ALL;
          nextNoteGroupTypeSelectionMap = nextNoteGroupTypeSelectionMap.set(
            noteGroupType,
            checked
          );
        }
      });

      return {
        ...state,
        scoreSettings: {
          ...state.scoreSettings,
          noteGroupTypeSelectionMap: nextNoteGroupTypeSelectionMap,
        },
      };
  }
};

export const createDispatchUpdateScoreSettings = (
  dispatch: React.Dispatch<Action>
) => (scoreSettings: Partial<ScoreSettings>) => {
  dispatch({
    type: ActionType.UPDATE_SCORE_SETTINGS,
    scoreSettingsToUpdate: scoreSettings,
  });
};
