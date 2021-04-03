import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from './Header';
import { FormFactor } from '../App';
import { PlaybackState } from '../modules/tone';
import userEvent from '@testing-library/user-event';

jest.mock('../modules/tone');

describe('The <Header /> component', () => {
  let settingsMenuClickHandler: jest.Mock;
  let mainMenuClickHandler: jest.Mock;

  describe('on desktop form factors', () => {
    beforeEach(() => {
      settingsMenuClickHandler = jest.fn();
      mainMenuClickHandler = jest.fn();

      render(
        <Header
          currentFormFactor={FormFactor.DESKTOP}
          measures={[]}
          playbackState={PlaybackState.STOPPED}
          metronomeOn={false}
          onPlaybackStateChange={jest.fn()}
          onNoteTrigger={jest.fn()}
          onMetronomeClickTrigger={jest.fn()}
          onRandomizeButtonClick={jest.fn()}
          onSettingsMenuButtonClick={settingsMenuClickHandler}
          onMainMenuButtonClick={mainMenuClickHandler}
          onMetronomeButtonClick={jest.fn()}
        />
      );
    });

    it('renders the expected heading', () => {
      expect(screen.getByRole('heading')).toHaveTextContent(
        'theRhythmRandomizer'
      );
    });

    it('calls the settings menu handler when the settings menu button is clicked', () => {
      const button = screen.getByAltText('openSettingsMenu');
      userEvent.click(button);
      expect(settingsMenuClickHandler).toHaveBeenCalled();
    });

    it('calls the main menu handler when the main menu button is clicked', () => {
      const button = screen.getByAltText('openMainMenu');
      userEvent.click(button);
      expect(mainMenuClickHandler).toHaveBeenCalled();
    });

    it('renders the nav after the main heading', () => {
      const heading = screen.getByRole('heading');
      const nav = screen.getByRole('navigation');
      expect(heading.nextElementSibling).toEqual(nav);
    });
  });

  describe('on mobile form factors', () => {
    beforeEach(() => {
      render(
        <Header
          currentFormFactor={FormFactor.MOBILE}
          measures={[]}
          playbackState={PlaybackState.STOPPED}
          metronomeOn={false}
          onPlaybackStateChange={jest.fn()}
          onNoteTrigger={jest.fn()}
          onMetronomeClickTrigger={jest.fn()}
          onRandomizeButtonClick={jest.fn()}
          onSettingsMenuButtonClick={settingsMenuClickHandler}
          onMainMenuButtonClick={mainMenuClickHandler}
          onMetronomeButtonClick={jest.fn()}
        />
      );
    });

    it('renders the nav at the end of the header', () => {
      const header = screen.getByRole('banner');
      const nav = screen.getByRole('navigation');
      expect(header.lastChild).toEqual(nav);
    });
  });
});
