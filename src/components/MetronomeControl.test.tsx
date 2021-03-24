import React, { Dispatch } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MetronomeControl from './MetronomeControl';
import { Action, ActionType, State } from '../modules/reducer';
import {
  AppContext,
  DEFAULT_METRONOME_SETTINGS,
  DEFAULT_SCORE_SETTINGS,
} from '../App';

describe('The <MetronomeControl /> component', () => {
  let state: State;
  let dispatch: Dispatch<Action>;

  beforeEach(() => {
    state = {
      scoreSettings: DEFAULT_SCORE_SETTINGS,
    };
    dispatch = jest.fn();

    render(
      <AppContext.Provider value={{ state, dispatch }}>
        <MetronomeControl />
      </AppContext.Provider>
    );
  });

  it('renders the expected active checkbox value', () => {
    expect(
      screen.getByRole('checkbox', { name: 'Play metronome during playback' })
    ).not.toBeChecked();
  });

  it('renders the expected start-of-measure click checkbox value', () => {
    expect(
      screen.getByRole('checkbox', { name: 'Start-of-measure click' })
    ).toBeChecked();
  });

  it('renders the expected subdivision click checkbox value', () => {
    expect(
      screen.getByRole('checkbox', { name: 'Subdivision click' })
    ).not.toBeChecked();
  });

  it('renders the expected count-off click dropdown value', () => {
    expect(screen.getByRole('combobox')).toHaveValue('0');
  });

  it('renders the expected options in the count-off click dropdown', () => {
    const options = screen.getAllByRole('option').map((element) => {
      const { label, value } = element as HTMLOptionElement;
      return { label, value };
    });

    expect(options).toEqual([
      { value: '0', label: 'Off' },
      { value: '1', label: '1 Measure' },
      { value: '2', label: '2 Measures' },
    ]);
  });

  it('dispatches the expected action when the active checkbox is clicked', () => {
    userEvent.click(screen.getByLabelText('Play metronome during playback'));
    expect(dispatch).toHaveBeenCalledWith({
      type: ActionType.UPDATE_SCORE_SETTINGS,
      scoreSettingsToUpdate: {
        metronomeSettings: {
          ...DEFAULT_METRONOME_SETTINGS,
          active: true,
        },
      },
    });
  });

  it('dispatches the expected action when the start-of-measure checkbox is clicked', () => {
    userEvent.click(screen.getByLabelText('Start-of-measure click'));
    expect(dispatch).toHaveBeenCalledWith({
      type: ActionType.UPDATE_SCORE_SETTINGS,
      scoreSettingsToUpdate: {
        metronomeSettings: {
          ...DEFAULT_METRONOME_SETTINGS,
          startOfMeasureClick: false,
        },
      },
    });
  });

  it('dispatches the expected action when the subdivision click checkbox is clicked', () => {
    userEvent.click(screen.getByLabelText('Subdivision click'));
    expect(dispatch).toHaveBeenCalledWith({
      type: ActionType.UPDATE_SCORE_SETTINGS,
      scoreSettingsToUpdate: {
        metronomeSettings: {
          ...DEFAULT_METRONOME_SETTINGS,
          subdivisionClick: true,
        },
      },
    });
  });

  it('dispatches the expected action when the count-off click dropdown is changed', () => {
    userEvent.selectOptions(screen.getByLabelText('Count-off click:'), '2');
    expect(dispatch).toHaveBeenCalledWith({
      type: ActionType.UPDATE_SCORE_SETTINGS,
      scoreSettingsToUpdate: {
        metronomeSettings: {
          ...DEFAULT_METRONOME_SETTINGS,
          countOffMeasures: 2,
        },
      },
    });
  });
});
