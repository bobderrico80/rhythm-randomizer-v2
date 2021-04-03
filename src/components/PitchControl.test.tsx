import React, { Dispatch } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PitchControl from './PitchControl';
import { Action, ActionType, State } from '../modules/reducer';
import { AppContext, DEFAULT_SCORE_SETTINGS } from '../App';
import { Octave, PitchClass } from '../modules/note';

describe('The <PitchControl /> component', () => {
  let state: State;
  let dispatch: Dispatch<Action>;

  beforeEach(() => {
    state = {
      scoreSettings: DEFAULT_SCORE_SETTINGS,
    };
    dispatch = jest.fn();

    render(
      <AppContext.Provider value={{ state, dispatch }}>
        <PitchControl />
      </AppContext.Provider>
    );
  });

  it('renders a <select /> with the expected 12 pitch class values', () => {
    const select = screen.getByLabelText('pitch:') as HTMLSelectElement;
    expect(select.options).toHaveLength(12);
  });

  it('renders the selected pitch option value from the context', () => {
    expect(screen.getByLabelText('pitch:')).toHaveValue('F');
  });

  it('dispatches UPDATE_SCORE_SETTINGS with expected value when the pitch is changed', () => {
    userEvent.selectOptions(screen.getByLabelText('pitch:'), 'G');
    expect(dispatch).toHaveBeenCalledWith({
      type: ActionType.UPDATE_SCORE_SETTINGS,
      scoreSettingsToUpdate: {
        pitch: {
          pitchClass: PitchClass.G,
          octave: Octave._4,
        },
      },
    });
  });

  it('renders a <select /> with the expected 8 octave values', () => {
    const select = screen.getByLabelText('octave:') as HTMLSelectElement;
    expect(select.options).toHaveLength(8);
  });

  it('renders the selected octave option value from the context', () => {
    expect(screen.getByLabelText('octave:')).toHaveValue('4');
  });

  it('dispatches UPDATE_SCORE_SETTINGS with expected value when the octave is changed', () => {
    userEvent.selectOptions(screen.getByLabelText('octave:'), '5');
    expect(dispatch).toHaveBeenCalledWith({
      type: ActionType.UPDATE_SCORE_SETTINGS,
      scoreSettingsToUpdate: {
        pitch: {
          pitchClass: PitchClass.F,
          octave: Octave._5,
        },
      },
    });
  });
});
