import React from 'react';
import {
  fireEvent,
  render,
  RenderResult,
  screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SlideOut from './SlideOut';

const renderPane = (renderExtraInput: boolean) => (
  open: boolean,
  onCloseClick: () => void
) => {
  return (
    <div>
      I am {open ? 'open' : 'closed'}
      <label htmlFor="test-input">
        Name:
        <input type="text" id="test-input" />
      </label>
      {renderExtraInput && (
        <label htmlFor="test-input-extra">
          Age:
          <input type="text" id="test-input-extra" />
        </label>
      )}
      <button type="button" onClick={onCloseClick}>
        Close
      </button>
    </div>
  );
};

describe('The <SlideOut /> component', () => {
  let closeClickHandler: jest.Mock;

  beforeEach(() => {
    closeClickHandler = jest.fn();
  });

  describe('when open', () => {
    beforeEach(() => {
      render(
        <div>
          <SlideOut
            open={true}
            label="Test"
            className="test-class"
            openClassName="test-class--open"
            closedClassName="test-class--closed"
            paneClassName="test-class__pane"
            openPaneClassName="test-class__pane--open"
            closedPaneClassName="test-class__pane--closed"
            overlayClassName="test-class__overlay"
            openOverlayClassName="test-class__overlay--open"
            closedOverlayClassName="test-class__overlay--closed"
            scrollToTop={false}
            focusDependency="test"
            renderPane={renderPane(false)}
            onCloseClick={closeClickHandler}
          />
          <button type="button">Not in modal</button>
        </div>
      );
    });

    it('renders the pane contents', () => {
      expect(screen.getByRole('dialog')).toHaveTextContent('I am open');
    });

    it('is accessible via the label', () => {
      expect(screen.getByLabelText('Test')).toEqual(screen.getByRole('dialog'));
    });

    it('it calls the `onCloseClick` handler when fired', () => {
      userEvent.click(screen.getByRole('button', { name: 'Close' }));
      expect(closeClickHandler).toHaveBeenCalled();
    });

    it('calls `onCloseClick` when the overlay is clicked', () => {
      userEvent.click(screen.getByTestId('slide-out__overlay'));
      expect(closeClickHandler).toHaveBeenCalled();
    });

    it('calls `onCloseClick` when the escape key is pressed', () => {
      userEvent.type(screen.getByRole('dialog'), '{esc}');
      expect(closeClickHandler).toHaveBeenCalled();
    });

    it('renders the container with the expected class names', () => {
      expect(screen.getByTestId('slide-out')).toHaveClass(
        'test-class',
        'test-class--open'
      );
    });

    it('renders the overlay with the expected class names', () => {
      expect(screen.getByTestId('slide-out__overlay')).toHaveClass(
        'test-class__overlay',
        'test-class__overlay--open'
      );
    });

    it('renders the pane with the expected class names', () => {
      expect(screen.getByTestId('slide-out__pane')).toHaveClass(
        'test-class__pane',
        'test-class__pane--open'
      );
    });

    it('focuses the first focusable element after the CSS transition completes', () => {
      fireEvent.transitionEnd(screen.getByRole('dialog'));
      expect(screen.getByRole('textbox')).toHaveFocus();
    });

    it('traps focus to focusable elements in the slide-out when tabbing', () => {
      const dialog = screen.getByRole('dialog');
      fireEvent.transitionEnd(dialog);

      // Two focusable elements in the slide-out. Tabbing twice will move focus to where
      // focus began
      userEvent.tab();
      userEvent.tab();
      expect(screen.getByRole('textbox')).toHaveFocus();
    });

    it('traps focus to focusable elements in the slide-out when shift+tabbing', () => {
      const dialog = screen.getByRole('dialog');
      fireEvent.transitionEnd(dialog);

      userEvent.tab({ shift: true });
      expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
    });
  });

  describe('when closed', () => {
    beforeEach(() => {
      render(
        <div>
          <SlideOut
            open={false}
            label="Test"
            className="test-class"
            openClassName="test-class--open"
            closedClassName="test-class--closed"
            paneClassName="test-class__pane"
            openPaneClassName="test-class__pane--open"
            closedPaneClassName="test-class__pane--closed"
            overlayClassName="test-class__overlay"
            openOverlayClassName="test-class__overlay--open"
            closedOverlayClassName="test-class__overlay--closed"
            scrollToTop={false}
            focusDependency="test"
            renderPane={renderPane(false)}
            onCloseClick={closeClickHandler}
          />
          <button type="button">Not in modal</button>
        </div>
      );
    });

    it('does not render any accessible pane components', () => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('renders the container with the expected class names', () => {
      expect(screen.getByTestId('slide-out')).toHaveClass(
        'test-class',
        'test-class--closed'
      );
    });

    it('renders the overlay with the expected class names', () => {
      expect(screen.getByTestId('slide-out__overlay')).toHaveClass(
        'test-class__overlay',
        'test-class__overlay--closed'
      );
    });

    it('renders the pane with the expected class names', () => {
      expect(screen.getByTestId('slide-out__pane')).toHaveClass(
        'test-class__pane',
        'test-class__pane--closed'
      );
    });
  });

  describe('when `scrollToTop` is true', () => {
    let scrollToSpy: jest.SpyInstance;

    beforeEach(() => {
      scrollToSpy = jest.spyOn(window.Element.prototype, 'scrollTo');

      render(
        <SlideOut
          open={true}
          label="Test"
          scrollToTop={true}
          focusDependency="test"
          renderPane={renderPane(false)}
          onCloseClick={closeClickHandler}
        />
      );
    });

    afterEach(() => {
      scrollToSpy.mockRestore();
    });

    it('scrolls the pane to the top when rendering', () => {
      expect(scrollToSpy).toHaveBeenCalledWith({
        left: 0,
        top: 0,
        behavior: 'smooth',
      });
    });
  });

  describe('when the focus dependency changes', () => {
    let renderResult: RenderResult;

    beforeEach(() => {
      renderResult = render(
        <SlideOut
          open={true}
          label="Test"
          scrollToTop={true}
          focusDependency="test"
          renderPane={renderPane(false)}
          onCloseClick={closeClickHandler}
        />
      );
      renderResult.rerender(
        <SlideOut
          open={true}
          label="Test"
          scrollToTop={true}
          focusDependency="test-extra"
          renderPane={renderPane(true)}
          onCloseClick={closeClickHandler}
        />
      );
    });

    it('recalculates focusable elements when the `focusDependency` property changes', () => {
      const dialog = screen.getByRole('dialog');
      fireEvent.transitionEnd(dialog);

      // Three focusable elements in the slide-out. Tabbing thrice will move focus to where
      // focus began
      userEvent.tab();
      userEvent.tab();
      userEvent.tab();
      expect(screen.getByRole('textbox', { name: 'Name:' })).toHaveFocus();
    });
  });
});
