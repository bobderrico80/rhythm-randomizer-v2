import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { Dispatch } from 'react';
import { AppContext, DEFAULT_SCORE_SETTINGS } from '../App';
import { Action, ActionType, State } from '../modules/reducer';
import {
  getTimeSignature,
  timeSignatures,
  TimeSignatureType,
} from '../modules/time-signature';
import TimeSignatureSelection from './TimeSignatureSelection';

describe('The <TimeSignatureSelection /> component', () => {
  let state: State;
  let dispatch: Dispatch<Action>;

  beforeEach(() => {
    state = {
      scoreSettings: DEFAULT_SCORE_SETTINGS,
    };
    dispatch = jest.fn();

    render(
      <AppContext.Provider value={{ state, dispatch }}>
        <TimeSignatureSelection timeSignatures={timeSignatures} />
      </AppContext.Provider>
    );
  });

  it('renders a fieldset for each category of time signatures', () => {
    expect(screen.getAllByRole('group')).toHaveLength(2);
  });

  it('renders a radio button for each time signature', () => {
    expect(screen.getAllByRole('radio')).toHaveLength(6);
  });

  it('renders selected the radio button for the time signature stored in the state', () => {
    expect(screen.getByTestId(TimeSignatureType.SIMPLE_4_4)).toBeChecked();
  });

  it('dispatches the expected action when a time signature selection is made', () => {
    userEvent.click(screen.getByTestId(TimeSignatureType.SIMPLE_3_4));
    expect(dispatch).toHaveBeenCalledWith({
      type: ActionType.UPDATE_SCORE_SETTINGS,
      scoreSettingsToUpdate: {
        timeSignature: getTimeSignature(TimeSignatureType.SIMPLE_3_4),
      },
    });
  });
});
