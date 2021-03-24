import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ShareButton from './ShareButton';

describe('The <ShareButton /> component', () => {
  let shareSettingsClickHandler: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    shareSettingsClickHandler = jest.fn();
    render(<ShareButton onShareSettingsClick={shareSettingsClickHandler} />);
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('renders the expected button text', () => {
    expect(screen.getByRole('button')).toHaveTextContent('Share Settings');
  });

  it('renders the expected button hover text', () => {
    expect(screen.getByRole('button')).toHaveAttribute(
      'title',
      'Click to copy share link to clipboard'
    );
  });

  describe('when clicked', () => {
    beforeEach(() => {
      userEvent.click(screen.getByRole('button'));
    });

    it('changes the button text', () => {
      expect(screen.getByRole('button')).toHaveTextContent(
        'Share link copied to clipboard!'
      );
    });

    it('changes the button hover text', () => {
      expect(screen.getByRole('button')).toHaveAttribute(
        'title',
        'Link Copied!'
      );
    });

    it('disables the button', () => {
      expect(screen.getByRole('button')).not.toBeEnabled();
    });

    describe('after 5 seconds', () => {
      beforeEach(() => {
        act(() => {
          jest.advanceTimersByTime(5000);
        });
      });

      it('changes the button back to its original text', async () => {
        expect(await screen.findByRole('button')).toHaveTextContent(
          'Share Settings'
        );
      });

      it('changes the button hover text back to its original text', async () => {
        expect(screen.getByRole('button')).toHaveAttribute(
          'title',
          'Click to copy share link to clipboard'
        );
      });

      it('enables the button', () => {
        expect(screen.getByRole('button')).toBeEnabled();
      });
    });
  });
});
