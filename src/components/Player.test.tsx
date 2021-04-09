import React, { Dispatch } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Player from './Player';
import { PlaybackState } from '../modules/tone';
import * as tone from '../modules/tone';
import { Action, State } from '../modules/reducer';
import { AppContext, DEFAULT_SCORE_SETTINGS } from '../App';
import { Octave, PitchClass } from '../modules/note-definition';
import { getTimeSignature, TimeSignatureType } from '../modules/time-signature';

jest.mock('../modules/tone');

const mockTransportOn = tone.Transport.on as jest.Mock;

describe('The <Player /> component', () => {
  let state: State;
  let dispatch: Dispatch<Action>;

  let playbackStateChangeHandler: jest.Mock;
  let noteTriggerHandler: jest.Mock;
  let metronomeClickTriggerHandler: jest.Mock;

  beforeEach(() => {
    state = {
      scoreSettings: DEFAULT_SCORE_SETTINGS,
    };
    dispatch = jest.fn();

    playbackStateChangeHandler = jest.fn();
    noteTriggerHandler = jest.fn();
    metronomeClickTriggerHandler = jest.fn();
  });

  describe('with playback stopped', () => {
    beforeEach(() => {
      render(
        <AppContext.Provider value={{ state, dispatch }}>
          <Player
            measures={[]}
            playbackState={PlaybackState.STOPPED}
            metronomeOn={false}
            className="test-class"
            onPlaybackStateChange={playbackStateChangeHandler}
            onNoteTrigger={noteTriggerHandler}
            onMetronomeClickTrigger={metronomeClickTriggerHandler}
          />
        </AppContext.Provider>
      );
    });

    it('renders a "Start Playback" button', () => {
      expect(screen.getByRole('button')).toHaveTextContent('startPlayback');
    });

    it('renders the button in an enabled state', () => {
      expect(screen.getByRole('button')).toBeEnabled();
    });

    it('adds the provided `className` to the button', () => {
      expect(screen.getByRole('button')).toHaveClass('test-class');
    });

    it('updates the tempo from the context value on rendering', () => {
      expect(tone.updateTempo).toHaveBeenCalledWith(80);
    });

    describe('when "Start Playback" is clicked', () => {
      beforeEach(() => {
        userEvent.click(screen.getByRole('button'));
      });

      it('calls the `onPlaybackStateChange` handler with the PLAYING playback state', () => {
        expect(playbackStateChangeHandler).toHaveBeenCalledWith(
          PlaybackState.PLAYING
        );
      });

      it('calls `startPlayback()` with expected parameters', () => {
        expect(tone.startPlayback).toHaveBeenCalledWith(
          [],
          { pitchClass: PitchClass.F, octave: Octave._4 },
          getTimeSignature(TimeSignatureType.SIMPLE_4_4),
          state.scoreSettings.metronomeSettings,
          noteTriggerHandler,
          metronomeClickTriggerHandler
        );
      });

      it('adds a "stop" event listener on the Transport object', () => {
        expect(tone.Transport.on).toHaveBeenCalledWith(
          'stop',
          expect.any(Function)
        );
      });
    });
  });

  describe('with playback started', () => {
    beforeEach(() => {
      render(
        <AppContext.Provider value={{ state, dispatch }}>
          <Player
            measures={[]}
            playbackState={PlaybackState.PLAYING}
            metronomeOn={false}
            className="test-class"
            onPlaybackStateChange={playbackStateChangeHandler}
            onNoteTrigger={noteTriggerHandler}
            onMetronomeClickTrigger={metronomeClickTriggerHandler}
          />
        </AppContext.Provider>
      );
    });

    it('renders a "Stop Playback" button', () => {
      expect(screen.getByRole('button')).toHaveTextContent('stopPlayback');
    });

    it('renders the button in an enabled state', () => {
      expect(screen.getByRole('button')).toBeEnabled();
    });

    it('calls `stopPlayback()` when "Stop Playback" is clicked', () => {
      userEvent.click(screen.getByRole('button'));
      expect(tone.stopPlayback).toHaveBeenCalled();
    });
  });

  describe('when playback stops', () => {
    let stopHandler: () => void;

    beforeEach(() => {
      mockTransportOn.mockImplementation(
        (eventName: string, callback: () => void) => {
          stopHandler = callback;
        }
      );

      render(
        <AppContext.Provider value={{ state, dispatch }}>
          <Player
            measures={[]}
            playbackState={PlaybackState.STOPPED}
            metronomeOn={false}
            className="test-class"
            onPlaybackStateChange={playbackStateChangeHandler}
            onNoteTrigger={noteTriggerHandler}
            onMetronomeClickTrigger={metronomeClickTriggerHandler}
          />
        </AppContext.Provider>
      );

      // Start playback to set up stopHandler
      userEvent.click(screen.getByRole('button'));

      // Stop playback, via handler, mocking the Transport behavior
      stopHandler();
    });

    afterEach(() => {
      mockTransportOn.mockRestore();
    });

    it('calls the `onPlaybackStateChange` handler with the STOPPED playback state', () => {
      expect(playbackStateChangeHandler).toHaveBeenCalledWith(
        PlaybackState.STOPPED
      );
    });

    it('removes the "stop" event listener from Transport', () => {
      expect(tone.Transport.off).toHaveBeenLastCalledWith('stop', stopHandler);
    });
  });

  describe('with metronome on', () => {
    beforeEach(() => {
      render(
        <AppContext.Provider value={{ state, dispatch }}>
          <Player
            measures={[]}
            playbackState={PlaybackState.STOPPED}
            metronomeOn={true}
            className="test-class"
            onPlaybackStateChange={playbackStateChangeHandler}
            onNoteTrigger={noteTriggerHandler}
            onMetronomeClickTrigger={metronomeClickTriggerHandler}
          />
        </AppContext.Provider>
      );
    });

    it('renders the button in a disabled state', () => {
      expect(screen.getByRole('button')).not.toBeEnabled();
    });
  });
});
