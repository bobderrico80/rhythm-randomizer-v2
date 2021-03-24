import React, { Dispatch } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NoteCheckboxGroup, { MultiSelectStatusType } from './NoteCheckboxGroup';
import { Action, ActionType, State } from '../modules/reducer';
import { AppContext, DEFAULT_SCORE_SETTINGS } from '../App';
import {
  getNoteGroupCategory,
  getNoteGroups,
  getNoteGroupTypeSelectionMap,
  NoteGroupCategoryType,
  NoteGroupType,
  resetNoteGroupTypeSelectionMap,
} from '../modules/note';

describe('The <NoteCheckboxGroup /> component', () => {
  let state: State;
  let dispatch: Dispatch<Action>;

  beforeEach(() => {
    dispatch = jest.fn();
  });

  describe('with not all options selected', () => {
    beforeEach(() => {
      // Whole and half are selected, quarter is not
      const noteGroupTypeSelectionMap = resetNoteGroupTypeSelectionMap(
        getNoteGroupTypeSelectionMap()
      )
        .set(NoteGroupType.W, true)
        .set(NoteGroupType.H, true);

      state = {
        scoreSettings: {
          ...DEFAULT_SCORE_SETTINGS,
          noteGroupTypeSelectionMap,
        },
      };

      render(
        <AppContext.Provider value={{ state, dispatch }}>
          <NoteCheckboxGroup
            category={getNoteGroupCategory(NoteGroupCategoryType.BASIC_NOTES)}
            noteGroups={getNoteGroups(
              NoteGroupType.W,
              NoteGroupType.H,
              NoteGroupType.Q
            )}
            noteGroupTypeSelectionMap={
              state.scoreSettings.noteGroupTypeSelectionMap
            }
          />
        </AppContext.Provider>
      );
    });

    it('renders a checkbox for each note group, with the expected note groups selected', () => {
      expect(
        screen.getByRole('checkbox', { name: 'a whole note' })
      ).toBeChecked();
      expect(
        screen.getByRole('checkbox', { name: 'a half note' })
      ).toBeChecked();
      expect(
        screen.getByRole('checkbox', { name: 'a quarter note' })
      ).not.toBeChecked();
    });

    it('renders a "select all" button', () => {
      expect(
        screen.getByRole('button', { name: 'Select all Basic Notes' })
      ).toBeInTheDocument();
    });

    it('dispatches a SET_NOTE_GROUP_SELECTION action when a note group is changed', () => {
      userEvent.click(screen.getByRole('checkbox', { name: 'a whole note' }));
      expect(dispatch).toHaveBeenCalledWith({
        type: ActionType.SET_NOTE_GROUP_SELECTION,
        noteGroupType: NoteGroupType.W,
        value: false,
      });
    });

    it('dispatches a SET_NOTE_GROUP_SELECTIONS_FOR_CATEGORY action when the "Select All" button is clicked', () => {
      userEvent.click(
        screen.getByRole('button', { name: 'Select all Basic Notes' })
      );
      expect(dispatch).toHaveBeenCalledWith({
        type: ActionType.SET_NOTE_GROUP_SELECTIONS_FOR_CATEGORY,
        category: getNoteGroupCategory(NoteGroupCategoryType.BASIC_NOTES),
        multiSelectStatusType: MultiSelectStatusType.SELECT_ALL,
      });
    });
  });

  describe('with all options selected', () => {
    beforeEach(() => {
      // All items in group are selected
      const noteGroupTypeSelectionMap = resetNoteGroupTypeSelectionMap(
        getNoteGroupTypeSelectionMap()
      )
        .set(NoteGroupType.W, true)
        .set(NoteGroupType.H, true)
        .set(NoteGroupType.Q, true);

      state = {
        scoreSettings: {
          ...DEFAULT_SCORE_SETTINGS,
          noteGroupTypeSelectionMap,
        },
      };

      render(
        <AppContext.Provider value={{ state, dispatch }}>
          <NoteCheckboxGroup
            category={getNoteGroupCategory(NoteGroupCategoryType.BASIC_NOTES)}
            noteGroups={getNoteGroups(
              NoteGroupType.W,
              NoteGroupType.H,
              NoteGroupType.Q
            )}
            noteGroupTypeSelectionMap={
              state.scoreSettings.noteGroupTypeSelectionMap
            }
          />
        </AppContext.Provider>
      );
    });

    it('renders a "select none" button', () => {
      expect(
        screen.getByRole('button', { name: 'Deselect all Basic Notes' })
      ).toBeInTheDocument();
    });

    it('dispatches a SET_NOTE_GROUP_SELECTIONS_FOR_CATEGORY action when the "Select None" button is clicked', () => {
      userEvent.click(
        screen.getByRole('button', { name: 'Deselect all Basic Notes' })
      );
      expect(dispatch).toHaveBeenCalledWith({
        type: ActionType.SET_NOTE_GROUP_SELECTIONS_FOR_CATEGORY,
        category: getNoteGroupCategory(NoteGroupCategoryType.BASIC_NOTES),
        multiSelectStatusType: MultiSelectStatusType.SELECT_NONE,
      });
    });
  });
});
