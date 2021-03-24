import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Accordion from './Accordion';

describe('The <Accordion /> component', () => {
  describe('default, closed state behavior', () => {
    beforeEach(() => {
      render(
        <Accordion
          id="test"
          paneLabel="test"
          renderButtonContents={() => 'test button'}
          renderPaneContents={() => 'test pane'}
          buttonClassName="button-class"
          containerClassName="container-class"
          openContainerClassName="open-container-class"
          closedContainerClassName="closed-container-class"
          paneClassName="pane-class"
          openPaneClassName="open-pane-class"
          closedPaneClassName="closed-pane-class"
        />
      );
    });

    it('renders the provided button contents into a <button />', () => {
      expect(screen.getByRole('button')).toHaveTextContent('test button');
    });

    it('renders with the pane inaccessible (closed) by default', () => {
      expect(screen.queryByRole('region')).toBeNull();
    });

    it('renders the component container with the provided class names', () => {
      expect(screen.getByTestId('accordion__container')).toHaveClass(
        'container-class',
        'closed-container-class'
      );
    });

    it('renders the button with the provided class name', () => {
      expect(screen.getByRole('button')).toHaveClass('button-class');
    });

    it('renders the pane with the provided class names', () => {
      expect(screen.getByTestId('accordion__pane')).toHaveClass(
        'pane-class',
        'closed-pane-class'
      );
    });

    it('renders the collapsed button caret', () => {
      expect(screen.getByAltText('Expand')).toBeDefined();
    });

    it('opens the pane when the button is clicked', async () => {
      userEvent.click(screen.getByRole('button'));
      const region = await screen.findByRole('region');
      expect(region).toHaveTextContent('test pane');
    });
  });

  describe('in an overridden open state', () => {
    beforeEach(() => {
      render(
        <Accordion
          id="test"
          paneLabel="test"
          isOpen={true}
          renderButtonContents={() => 'test button'}
          renderPaneContents={() => 'test pane'}
          buttonClassName="button-class"
          containerClassName="container-class"
          openContainerClassName="open-container-class"
          closedContainerClassName="closed-container-class"
          paneClassName="pane-class"
          openPaneClassName="open-pane-class"
          closedPaneClassName="closed-pane-class"
        />
      );
    });

    it('initially renders with the pane accessible (open), with the expected pane contents', () => {
      expect(screen.getByRole('region')).toHaveTextContent('test pane');
    });

    it('renders the component container with the provided class names', () => {
      expect(screen.getByTestId('accordion__container')).toHaveClass(
        'container-class',
        'open-container-class'
      );
    });

    it('renders the button with the provided class name', () => {
      expect(screen.getByRole('button')).toHaveClass('button-class');
    });

    it('renders the pane with the provided class names', () => {
      expect(screen.getByTestId('accordion__pane')).toHaveClass(
        'pane-class',
        'open-pane-class'
      );
    });

    it('renders the expanded button caret', () => {
      expect(screen.getByAltText('Collapse')).toBeDefined();
    });

    it('closes the pane when the button is clicked', () => {
      userEvent.click(screen.getByRole('button'));
      const region = screen.queryByRole('region');
      expect(region).toBeNull();
    });
  });

  describe('with state controlled outside of the component', () => {
    let toggleClickHandler: jest.Mock;

    beforeEach(() => {
      toggleClickHandler = jest.fn();

      render(
        <Accordion
          id="test"
          paneLabel="test"
          isOpen={false}
          onToggleClick={toggleClickHandler}
          renderButtonContents={() => 'test button'}
          renderPaneContents={() => 'test pane'}
        />
      );
    });

    it('calls the `onToggleClick` handler with the `id` and next toggled state when clicked', () => {
      userEvent.click(screen.getByRole('button'));
      expect(toggleClickHandler).toHaveBeenCalledWith('test', true);
    });

    it('does not toggle the accordion internally', () => {
      userEvent.click(screen.getByRole('button'));
      const region = screen.queryByRole('region');
      expect(region).toBeNull();
    });
  });

  describe('with an `onTransitionComplete` handler', () => {
    let transitionCompleteHandler: jest.Mock;

    beforeEach(() => {
      transitionCompleteHandler = jest.fn();

      render(
        <Accordion
          id="test"
          paneLabel="test"
          onTransitionComplete={transitionCompleteHandler}
          renderButtonContents={() => 'test button'}
          renderPaneContents={() => 'test pane'}
        />
      );
    });

    it('calls the `onTransitionComplete` handler with the `id` and next toggled state when clicked', async () => {
      userEvent.click(screen.getByRole('button'));
      waitFor(() => {
        expect(transitionCompleteHandler).toHaveBeenCalledWith(true, 'test');
      });
    });
  });
});
