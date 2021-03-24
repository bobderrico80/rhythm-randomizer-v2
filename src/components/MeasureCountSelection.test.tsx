import React, { Dispatch } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MeasureCountSelection from './MeasureCountSelection';
import { AppContext, DEFAULT_SCORE_SETTINGS } from '../App';
import { Action, ActionType, State } from '../modules/reducer';

describe('The <MeasureCountSelection /> component', () => {
  let state: State;
  let dispatch: Dispatch<Action>;

  beforeEach(() => {
    state = {
      scoreSettings: DEFAULT_SCORE_SETTINGS,
    };
    dispatch = jest.fn();

    render(
      <AppContext.Provider value={{ state, dispatch }}>
        <MeasureCountSelection measureCountOptions={[1, 2, 4, 8]} />
      </AppContext.Provider>
    );
  });

  it('sets the <select /> value to the `measureCount` value from AppContext', () => {
    expect(screen.getByRole('combobox')).toHaveValue('4');
  });

  it('renders the expected options in the <select />', () => {
    const options = screen.getAllByRole('option').map((element) => {
      const option = element as HTMLOptionElement;
      return {
        label: option.label,
        value: option.value,
      };
    });

    expect(options).toEqual([
      { label: '1 measure', value: '1' },
      { label: '2 measures', value: '2' },
      { label: '4 measures', value: '4' },
      { label: '8 measures', value: '8' },
    ]);
  });

  it('dispatches the appropriate action when the select is changed', () => {
    userEvent.selectOptions(screen.getByRole('combobox'), '1');
    expect(dispatch).toHaveBeenCalledWith({
      type: ActionType.UPDATE_SCORE_SETTINGS,
      scoreSettingsToUpdate: { measureCount: 1 },
    });
  });
});
