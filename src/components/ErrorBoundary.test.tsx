import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

const BadComponent = () => {
  throw new Error();
};

describe('The <ErrorBoundary /> component', () => {
  describe('with no error', () => {
    beforeEach(() => {
      render(
        <ErrorBoundary>
          <h1>Hello, world!</h1>
        </ErrorBoundary>
      );
    });

    it('renders the provided children', () => {
      expect(screen.getByRole('heading')).toHaveTextContent('Hello, world!');
    });
  });

  describe('with an error', () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      // Suppress the error boundary warnings during the test
      consoleErrorSpy = jest.spyOn(console, 'error');
      consoleErrorSpy.mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <BadComponent />
        </ErrorBoundary>
      );
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it('renders the error page', () => {
      expect(screen.getByRole('main')).toHaveTextContent(
        'An unknown error occurred.'
      );
    });
  });
});
