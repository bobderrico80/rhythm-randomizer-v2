import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IconButton from './IconButton';

describe('The <IconButton /> component', () => {
  let clickHandler: jest.Mock;
  let button: HTMLButtonElement;
  let img: HTMLImageElement;

  beforeEach(() => {
    clickHandler = jest.fn();

    render(
      <IconButton
        svg="test.svg"
        alt="test icon"
        className="test-class"
        id="test-id"
        onClick={clickHandler}
        aria-labelledby="test-aria"
      />
    );
    button = screen.getByRole('button') as HTMLButtonElement;
    img = screen.getByRole('img') as HTMLImageElement;
  });

  it('passes the `svg` prop to the <img /> element `src` attribute', () => {
    expect(img).toHaveAttribute('src', 'test.svg');
  });

  it('passes the `alt` prop to the <img /> element `alt` attribute', () => {
    expect(img).toHaveAttribute('alt', 'test icon');
  });

  it('passes the `id` prop to the `<button />` element `id` attribute', () => {
    expect(button).toHaveAttribute('id', 'test-id');
  });

  it('passes the `className` prop to the `<button />` element `className` attribute', () => {
    expect(button).toHaveClass('test-class');
  });

  it('passes additional props to the `<button />` element', () => {
    expect(button).toHaveAttribute('aria-labelledby', 'test-aria');
  });

  it('class the `onClick` handler when the button is clicked', () => {
    userEvent.click(button);
    expect(clickHandler).toHaveBeenCalled();
  });
});
