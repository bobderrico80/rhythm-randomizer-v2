import React from 'react';
import fetch from 'jest-fetch-mock';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MainMenu from './MainMenu';

describe('The <MainMenu /> component', () => {
  let mainMenuCloseClickHandler: jest.Mock;

  beforeEach(() => {
    fetch.mockResponse(async () => 'Release notes!');
    mainMenuCloseClickHandler = jest.fn();
  });

  describe('when the menu is open', () => {
    beforeEach(async () => {
      render(
        <MainMenu
          mainMenuOpen={true}
          onMainMenuCloseClick={mainMenuCloseClickHandler}
        />
      );
      waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    });

    afterEach(async () => {
      fetch.resetMocks();
    });

    it('renders the fetched release notes', () => {
      expect(screen.getByText('Release notes!')).toBeInTheDocument();
    });

    it('renders the status footer info', () => {
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveTextContent('All Rights Reserved');
    });

    it('calls the `onMainMenuCloseClick` handler when the close button is clicked', () => {
      userEvent.click(screen.getByAltText('Close Main Menu'));
      expect(mainMenuCloseClickHandler).toHaveBeenCalled();
    });
  });
});
