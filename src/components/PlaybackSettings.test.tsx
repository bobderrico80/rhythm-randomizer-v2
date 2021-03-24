import React, { Dispatch } from 'react';
import { render, screen } from '@testing-library/react';
import PlaybackSettings from './PlaybackSettings';
import { Action, State } from '../modules/reducer';
import { AppContext, DEFAULT_SCORE_SETTINGS } from '../App';

describe('The <PlaybackSettings /> component', () => {
  let state: State;
  let dispatch: Dispatch<Action>;

  beforeEach(() => {
    state = {
      scoreSettings: DEFAULT_SCORE_SETTINGS,
    };
    dispatch = jest.fn();

    render(
      <AppContext.Provider value={{ state, dispatch }}>
        <PlaybackSettings />
      </AppContext.Provider>
    );
  });

  it('renders a fieldset for each playback setting control', () => {
    expect(
      screen.getByRole('group', { name: 'Tempo Settings' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('group', { name: 'Pitch Settings' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('group', { name: 'Metronome Settings' })
    ).toBeInTheDocument();
  });
});
