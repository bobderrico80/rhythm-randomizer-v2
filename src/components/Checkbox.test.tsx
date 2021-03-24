import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Checkbox from './Checkbox';

describe('The <Checkbox /> component', () => {
  let checkbox: HTMLInputElement;
  let clickHandler: jest.Mock;

  beforeEach(() => {
    clickHandler = jest.fn();
  });

  describe('with typical behavior', () => {
    beforeEach(() => {
      render(
        <Checkbox
          id="test"
          checked={false}
          onChange={clickHandler}
          renderLabel={() => <>Foo</>}
          className="input-class"
          labelClassName="label-class"
        />
      );

      checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    });

    it('renders the checkbox with the expected label', () => {
      expect(checkbox.parentElement).toHaveTextContent('Foo');
    });

    it('renders the checkbox with the provided `checked` state', () => {
      expect(checkbox).not.toBeChecked();
    });

    it('renders the checkbox with the provided `className`', () => {
      expect(checkbox).toHaveClass('input-class');
    });

    it('renders the checkbox label with the provided `labelClassName`', () => {
      const label = checkbox.parentElement;
      expect(label).toHaveClass('label-class');
    });

    it('calls the `onClick` handler with the provided `id` and new checkbox `checked` value', () => {
      userEvent.click(checkbox);
      expect(clickHandler).toHaveBeenCalledWith(true, 'test');
    });
  });

  describe('with a dynamic label based on checkbox state', () => {
    beforeEach(() => {
      render(
        <Checkbox
          id="test"
          checked={false}
          onChange={clickHandler}
          renderLabel={(checked) => (
            <>{checked ? 'I am checked' : 'I am not checked'}</>
          )}
          className="input-class"
          labelClassName="label-class"
        />
      );

      checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    });

    it('contains the expected label text based on the `checked` value', () => {
      expect(checkbox.parentElement).toHaveTextContent('I am not checked');
    });
  });
});
