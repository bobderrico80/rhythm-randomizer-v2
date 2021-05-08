import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { Dispatch } from 'react';
import { AppContext, DEFAULT_SCORE_SETTINGS } from '../App';
import { Action, ActionType, State } from '../modules/reducer';
import { getTimeSignature, TimeSignatureType } from '../modules/time-signature';
import TempoControl from './TempoControl';

describe('The <TempoControl /> component', () => {
  let input: HTMLInputElement;
  let state: State;
  let dispatch: Dispatch<Action>;

  beforeEach(() => {
    jest.useFakeTimers();
    dispatch = jest.fn();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  describe('with simple time signatures', () => {
    beforeEach(() => {
      state = {
        scoreSettings: DEFAULT_SCORE_SETTINGS,
      };

      render(
        <AppContext.Provider value={{ state, dispatch }}>
          <TempoControl />
        </AppContext.Provider>
      );

      input = screen.getByRole('textbox') as HTMLInputElement;
    });

    it('renders an MM marking icon for simple meters', () => {
      expect(screen.getByAltText('quarterNote')).toBeInTheDocument();
    });

    it('renders the expected tempo value from the state in the input', async () => {
      await waitFor(() => {
        expect(input).toHaveValue('80');
      });
    });

    it('updates the input display value internally while the input still has focus', async () => {
      userEvent.clear(input);
      userEvent.type(input, '120');
      await waitFor(() => {
        expect(input).toHaveValue('120');
      });
    });

    it('dispatches an action to update the tempo setting on input blur', async () => {
      userEvent.clear(input);
      userEvent.type(input, '120');
      userEvent.tab();
      await waitFor(() => {
        expect(dispatch).toHaveBeenCalledWith({
          type: ActionType.UPDATE_SCORE_SETTINGS,
          scoreSettingsToUpdate: {
            tempo: 120,
          },
        });
      });
    });

    it('does not allow values beyond the max tempo', async () => {
      userEvent.clear(input);
      userEvent.type(input, '301');
      userEvent.tab();
      await waitFor(() => {
        expect(dispatch).toHaveBeenCalledWith({
          type: ActionType.UPDATE_SCORE_SETTINGS,
          scoreSettingsToUpdate: {
            tempo: 300,
          },
        });
        expect(input).toHaveValue('300');
      });
    });

    it('does not allow values below the min tempo', async () => {
      userEvent.clear(input);
      userEvent.type(input, '39');
      userEvent.tab();
      await waitFor(() => {
        expect(dispatch).toHaveBeenCalledWith({
          type: ActionType.UPDATE_SCORE_SETTINGS,
          scoreSettingsToUpdate: {
            tempo: 40,
          },
        });
        expect(input).toHaveValue('40');
      });
    });

    it('increases the tempo by one when the increase tempo button is clicked', async () => {
      userEvent.click(screen.getByLabelText('increaseTempo'));
      await waitFor(() => {
        expect(dispatch).toHaveBeenCalledWith({
          type: ActionType.UPDATE_SCORE_SETTINGS,
          scoreSettingsToUpdate: {
            tempo: 81,
          },
        });
      });
    });

    it('decreases the tempo by one when the decrease tempo button is clicked', async () => {
      userEvent.click(screen.getByLabelText('decreaseTempo'));
      await waitFor(() => {
        expect(dispatch).toHaveBeenCalledWith({
          type: ActionType.UPDATE_SCORE_SETTINGS,
          scoreSettingsToUpdate: {
            tempo: 79,
          },
        });
      });
    });

    it('does not allow tempo to be increased beyond max with the button', async () => {
      userEvent.clear(input);
      userEvent.type(input, '300');
      userEvent.click(screen.getByLabelText('increaseTempo'));
      await waitFor(() => {
        expect(dispatch).toHaveBeenCalledWith({
          type: ActionType.UPDATE_SCORE_SETTINGS,
          scoreSettingsToUpdate: {
            tempo: 300,
          },
        });
      });
    });

    it('does not allow tempo to be decreased beyond min with the button', async () => {
      userEvent.clear(input);
      userEvent.type(input, '40');
      userEvent.click(screen.getByLabelText('decreaseTempo'));
      await waitFor(() => {
        expect(dispatch).toHaveBeenCalledWith({
          type: ActionType.UPDATE_SCORE_SETTINGS,
          scoreSettingsToUpdate: {
            tempo: 40,
          },
        });
      });
    });

    it('increases the tempo by 10 every half second when the increase tempo button is clicked, dispatching an action only when the mouse is released', async () => {
      const button = screen.getByLabelText('increaseTempo');
      fireEvent.mouseDown(button);

      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(input).toHaveValue('90');
        expect(dispatch).not.toHaveBeenCalled();
      });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      fireEvent.mouseUp(button);

      await waitFor(() => {
        expect(input).toHaveValue('100');
        expect(dispatch).toHaveBeenCalledWith({
          type: ActionType.UPDATE_SCORE_SETTINGS,
          scoreSettingsToUpdate: {
            tempo: 100,
          },
        });
      });
    });

    it('decreases the tempo by 10 every half second when the decrease tempo button is clicked, dispatching an action only when the mouse is released', async () => {
      const button = screen.getByLabelText('decreaseTempo');
      fireEvent.mouseDown(button);

      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(input).toHaveValue('70');
        expect(dispatch).not.toHaveBeenCalled();
      });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      fireEvent.mouseUp(button);

      await waitFor(() => {
        expect(input).toHaveValue('60');
        expect(dispatch).toHaveBeenCalledWith({
          type: ActionType.UPDATE_SCORE_SETTINGS,
          scoreSettingsToUpdate: {
            tempo: 60,
          },
        });
      });
    });

    it('does not allow the tempo to be increased beyond the max when holding the mouse button', async () => {
      const button = screen.getByLabelText('increaseTempo');
      fireEvent.mouseDown(button);

      // Hold for a while to try to get beyond the max
      // Starting at 80, for 12 seconds will get to 320 without restraint
      act(() => {
        jest.advanceTimersByTime(12000);
      });

      fireEvent.mouseUp(button);

      await waitFor(() => {
        expect(input).toHaveValue('300');
        expect(dispatch).toHaveBeenCalledWith({
          type: ActionType.UPDATE_SCORE_SETTINGS,
          scoreSettingsToUpdate: {
            tempo: 300,
          },
        });
      });
    });

    it('does not allow the tempo to be decreased beyond the min when holding the mouse button', async () => {
      const button = screen.getByLabelText('decreaseTempo');
      fireEvent.mouseDown(button);

      // Hold for a while to try to get beyond the min
      // Starting at 80, for 3 seconds will get to 20 without restraint
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      fireEvent.mouseUp(button);

      await waitFor(() => {
        expect(input).toHaveValue('40');
        expect(dispatch).toHaveBeenCalledWith({
          type: ActionType.UPDATE_SCORE_SETTINGS,
          scoreSettingsToUpdate: {
            tempo: 40,
          },
        });
      });
    });
  });

  describe('with compound time signatures', () => {
    beforeEach(() => {
      state = {
        scoreSettings: {
          ...DEFAULT_SCORE_SETTINGS,
          timeSignature: getTimeSignature(TimeSignatureType.COMPOUND_6_8),
        },
      };

      render(
        <AppContext.Provider value={{ state, dispatch }}>
          <TempoControl />
        </AppContext.Provider>
      );
    });

    it('renders an MM marking icon for compound meters', () => {
      expect(screen.getByAltText('dottedQuarterNote')).toBeInTheDocument();
    });
  });

  describe('with alla breve time signatures', () => {
    beforeEach(() => {
      state = {
        scoreSettings: {
          ...DEFAULT_SCORE_SETTINGS,
          timeSignature: getTimeSignature(TimeSignatureType.ALLA_BREVE_2_2),
        },
      };

      render(
        <AppContext.Provider value={{ state, dispatch }}>
          <TempoControl />
        </AppContext.Provider>
      );
    });

    it('renders an MM marking icon for compound meters', () => {
      expect(screen.getByAltText('halfNote')).toBeInTheDocument();
    });
  });
});
