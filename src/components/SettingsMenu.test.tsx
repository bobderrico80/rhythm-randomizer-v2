import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MEASURE_COUNT_OPTIONS } from '../App';
import { timeSignatures } from '../modules/time-signature';
import SettingsMenu from './SettingsMenu';

describe('The <SettingsMenu /> component', () => {
  let settingsCloseClickHandler: jest.Mock;
  let openAccordionChangeHandler: jest.Mock;
  let shareLinkClickHandler: jest.Mock;

  beforeEach(() => {
    settingsCloseClickHandler = jest.fn();
    openAccordionChangeHandler = jest.fn();
    shareLinkClickHandler = jest.fn();
  });

  describe('when the menu is open', () => {
    beforeEach(() => {
      render(
        <SettingsMenu
          settingsMenuOpen={true}
          openAccordion="note-selection-accordion"
          timeSignatures={timeSignatures}
          measureCountOptions={MEASURE_COUNT_OPTIONS}
          errorMessage=""
          onSettingsMenuCloseClick={settingsCloseClickHandler}
          onOpenAccordionChange={openAccordionChangeHandler}
          onShareLinkClick={shareLinkClickHandler}
        />
      );
    });

    it('renders with the provided accordion open', () => {
      expect(screen.getByRole('region').id).toEqual('note-selection-accordion');
    });

    it('calls `onSettingsMenuCloseClick` when the close button is clicked', () => {
      userEvent.click(screen.getByAltText('closeSettingsMenu'));
      expect(settingsCloseClickHandler).toHaveBeenCalled();
    });

    it('calls `onOpenAccordionChange` when another accordion is opened', () => {
      userEvent.click(screen.getByText('playbackSettings'));
      expect(openAccordionChangeHandler).toHaveBeenCalledWith(
        'playback-settings-accordion'
      );
    });

    it('calls `onShareLinkClick` when the Share button is clicked', () => {
      userEvent.click(screen.getByText('shareSettings'));
      expect(shareLinkClickHandler).toHaveBeenCalled();
    });
  });
});
