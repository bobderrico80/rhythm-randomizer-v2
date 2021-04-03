import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HeaderNav from './HeaderNav';
import { PlaybackState } from '../modules/tone';

jest.mock('../modules/tone');

describe('The <HeaderNav /> component', () => {
  let randomizeButtonClickHandler: jest.Mock;
  let metronomeButtonClickHandler: jest.Mock;
  let randomizeButton: HTMLButtonElement;
  let metronomeButton: HTMLButtonElement;

  beforeEach(() => {
    randomizeButtonClickHandler = jest.fn();
    metronomeButtonClickHandler = jest.fn();
  });

  describe('with metronome and playback stopped', () => {
    beforeEach(() => {
      render(
        <HeaderNav
          measures={[]}
          playbackState={PlaybackState.STOPPED}
          metronomeOn={false}
          onPlaybackStateChange={jest.fn()}
          onNoteTrigger={jest.fn()}
          onMetronomeClickTrigger={jest.fn()}
          onRandomizeButtonClick={randomizeButtonClickHandler}
          onMetronomeButtonClick={metronomeButtonClickHandler}
        />
      );
      randomizeButton = screen.getByRole('button', {
        name: 'newRhythm',
      }) as HTMLButtonElement;
      metronomeButton = screen.getByRole('button', {
        name: 'startMetronome',
      }) as HTMLButtonElement;
    });

    it('renders the New Rhythm button enabled', () => {
      expect(randomizeButton).toBeEnabled();
    });

    it('renders the Start Metronome button enabled', () => {
      expect(metronomeButton).toBeEnabled();
    });

    it('calls `onRandomizeButtonClick` when the New Rhythm button is clicked', () => {
      userEvent.click(randomizeButton);
      expect(randomizeButtonClickHandler).toHaveBeenCalled();
    });

    it('calls `onMetronomeButtonClick` when the Start Metronome button is clicked', () => {
      userEvent.click(metronomeButton);
      expect(metronomeButtonClickHandler).toHaveBeenCalled();
    });
  });

  describe('with playback started', () => {
    beforeEach(() => {
      render(
        <HeaderNav
          measures={[]}
          playbackState={PlaybackState.PLAYING}
          metronomeOn={false}
          onPlaybackStateChange={jest.fn()}
          onNoteTrigger={jest.fn()}
          onMetronomeClickTrigger={jest.fn()}
          onRandomizeButtonClick={randomizeButtonClickHandler}
          onMetronomeButtonClick={metronomeButtonClickHandler}
        />
      );
      randomizeButton = screen.getByRole('button', {
        name: 'newRhythm',
      }) as HTMLButtonElement;
      metronomeButton = screen.getByRole('button', {
        name: 'startMetronome',
      }) as HTMLButtonElement;
    });

    it('renders the New Rhythm button disabled', () => {
      expect(randomizeButton).not.toBeEnabled();
    });

    it('renders the Start Metronome button disabled', () => {
      expect(metronomeButton).not.toBeEnabled();
    });
  });

  describe('with metronome on', () => {
    beforeEach(() => {
      render(
        <HeaderNav
          measures={[]}
          playbackState={PlaybackState.STOPPED}
          metronomeOn={true}
          onPlaybackStateChange={jest.fn()}
          onNoteTrigger={jest.fn()}
          onMetronomeClickTrigger={jest.fn()}
          onRandomizeButtonClick={randomizeButtonClickHandler}
          onMetronomeButtonClick={metronomeButtonClickHandler}
        />
      );
      randomizeButton = screen.getByRole('button', {
        name: 'newRhythm',
      }) as HTMLButtonElement;
      metronomeButton = screen.getByRole('button', {
        name: 'stopMetronome',
      }) as HTMLButtonElement;
    });

    it('renders the New Rhythm button disabled', () => {
      expect(randomizeButton).not.toBeEnabled();
    });

    it('renders the Stop Metronome button enabled', () => {
      expect(metronomeButton).toBeEnabled();
    });

    it('calls `onMetronomeButtonClick` when the Stop Metronome button is clicked', () => {
      userEvent.click(metronomeButton);
      expect(metronomeButtonClickHandler).toHaveBeenCalled();
    });
  });
});
