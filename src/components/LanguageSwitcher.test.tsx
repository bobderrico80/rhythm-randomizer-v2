import React from 'react';
import i18n from 'i18next';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as events from '../modules/events';
import LanguageSwitcher from './LanguageSwitcher';

jest.mock('../modules/events');

const mockSendEvent = events.sendEvent as jest.Mock;
const mockChangeLanguage = i18n.changeLanguage as jest.Mock;

describe('The <LanguageSwitcher /> component', () => {
  let setAttributeSpy: jest.SpyInstance;

  describe('with multiple language options', () => {
    beforeEach(() => {
      setAttributeSpy = jest.spyOn(document.documentElement, 'setAttribute');
      render(<LanguageSwitcher supportedLanguageCodes={['en', 'es', 'fr']} />);
    });

    afterEach(() => {
      mockSendEvent.mockReset();
      mockChangeLanguage.mockReset();
      setAttributeSpy.mockRestore();
    });

    it('displays the current language', () => {
      expect(
        screen.getByTestId('language-switcher__current-language')
      ).toHaveTextContent('currentLanguage: en.');
    });

    it('renders buttons for each available alternate language', () => {
      expect(screen.getAllByRole('button')[0]).toHaveTextContent('es');
      expect(screen.getAllByRole('button')[1]).toHaveTextContent('fr');
    });

    it('formats the language button text and label as expected', () => {
      expect(
        screen.getByTestId('language-switcher__alt-languages')
      ).toHaveTextContent('translateTo: es | fr');
    });

    describe('when an alternate language button is clicked', () => {
      beforeEach(() => {
        userEvent.click(screen.getByRole('button', { name: 'es' }));
      });

      it('calls i18n.changeLanguage() with the new language code when an alternate language button is clicked', () => {
        expect(mockChangeLanguage).toHaveBeenCalledWith('es');
      });

      it('updates the lang attribute of the html element', () => {
        expect(setAttributeSpy).toHaveBeenCalledWith('lang', 'es');
      });

      it('logs an event', () => {
        expect(mockSendEvent).toHaveBeenCalledWith(
          events.EventCategory.LANGUAGE,
          events.EventAction.CHANGED,
          'es'
        );
      });
    });
  });

  describe('with one other language option', () => {
    beforeEach(() => {
      render(<LanguageSwitcher supportedLanguageCodes={['en', 'es']} />);
    });

    it('formats the single language button and label as expected', () => {
      expect(
        screen.getByTestId('language-switcher__alt-languages')
      ).toHaveTextContent('translateTo: es');
    });
  });

  describe('with no other language options', () => {
    beforeEach(() => {
      render(<LanguageSwitcher supportedLanguageCodes={['en']} />);
    });

    it('does not render the alternate languages', () => {
      expect(
        screen.queryByTestId('language-switcher__alt-languages')
      ).not.toBeInTheDocument();
    });
  });
});
