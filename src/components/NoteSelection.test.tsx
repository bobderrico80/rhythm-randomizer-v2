import React, { Dispatch } from 'react';
import { render, screen } from '@testing-library/react';
import NoteSelection from './NoteSelection';
import { Action, State } from '../modules/reducer';
import { AppContext, DEFAULT_SCORE_SETTINGS } from '../App';

describe('The <NoteSelection /> component', () => {
  let state: State;
  let dispatch: Dispatch<Action>;

  beforeEach(() => {
    state = {
      scoreSettings: DEFAULT_SCORE_SETTINGS,
    };
    dispatch = jest.fn();

    render(
      <AppContext.Provider value={{ state, dispatch }}>
        <NoteSelection />
      </AppContext.Provider>
    );
  });

  it('renders a note checkbox group for each category with notes that match the time signature', () => {
    // 8 categories for the default simple 4/4 time signature
    expect(screen.getAllByRole('group')).toHaveLength(8);
  });

  it('does not include note groups that do not match the current time signature', () => {
    // dotted quarter note not valid for default simple 4/4 time signature
    expect(
      screen.queryByRole('checkbox', { name: 'a dotted quarter note' })
    ).not.toBeInTheDocument();
  });
});
