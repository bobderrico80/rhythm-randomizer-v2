import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MEASURE_COUNT_OPTIONS } from '../App';
import { timeSignatures } from '../modules/time-signature';
import SettingsForm from './SettingsForm';

describe('The <SettingsForm /> component', () => {
  let openAccordionChangeHandler: jest.Mock;
  let accordionTransitionCompleteHandler: jest.Mock;

  beforeEach(() => {
    openAccordionChangeHandler = jest.fn();
    accordionTransitionCompleteHandler = jest.fn();
  });

  describe('with no error message', () => {
    beforeEach(() => {
      render(
        <SettingsForm
          openAccordion="note-selection-accordion"
          timeSignatures={timeSignatures}
          measureCountOptions={MEASURE_COUNT_OPTIONS}
          errorMessage=""
          onOpenAccordionChange={openAccordionChangeHandler}
          onAccordionTransitionComplete={accordionTransitionCompleteHandler}
        />
      );
    });

    it('renders with only the specified accordion open', () => {
      expect(screen.getByRole('region').id).toEqual('note-selection-accordion');
    });

    it('calls `onOpenAccordionChange` when another accordion is opened', () => {
      userEvent.click(screen.getByText('playbackSettings'));
      expect(openAccordionChangeHandler).toHaveBeenCalledWith(
        'playback-settings-accordion'
      );
    });

    it('does not call `onOpenAccordionChange` if the currently open accordion trigger is clicked', () => {
      userEvent.click(screen.getByText('noteSelection'));
      expect(openAccordionChangeHandler).not.toHaveBeenCalled();
    });

    it('calls `onAccordionTransitionComplete` after an accordion opens', async () => {
      userEvent.click(screen.getByText('playbackSettings'));
      waitFor(() => {
        expect(accordionTransitionCompleteHandler).toHaveBeenCalledWith(
          true,
          'playback-settings-accordion'
        );
      });
    });
  });

  describe('with an error message', () => {
    beforeEach(() => {
      render(
        <SettingsForm
          openAccordion="note-selection-accordion"
          timeSignatures={timeSignatures}
          measureCountOptions={MEASURE_COUNT_OPTIONS}
          errorMessage="Something is wrong"
          onOpenAccordionChange={openAccordionChangeHandler}
          onAccordionTransitionComplete={accordionTransitionCompleteHandler}
        />
      );
    });

    it('renders the error message', () => {
      expect(screen.getByText('Something is wrong')).toBeInTheDocument();
    });
  });
});
