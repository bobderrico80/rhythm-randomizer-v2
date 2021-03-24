import React from 'react';
import { render, screen } from '@testing-library/react';
import Icon from './Icon';

describe('The <Icon /> component', () => {
  let img: HTMLImageElement;

  beforeEach(() => {
    render(<Icon svg="test.svg" alt="test icon" className="test-class" />);
    img = screen.getByRole('img') as HTMLImageElement;
  });

  it('passes the `svg` prop to the <img /> element `src` attribute', () => {
    expect(img).toHaveAttribute('src', 'test.svg');
  });

  it('passes the `alt` prop to the <img /> element `alt attribute`', () => {
    expect(img).toHaveAttribute('alt', 'test icon');
  });

  it('passes the `className` prop to the <img /> element `className` attribute', () => {
    expect(img).toHaveClass('test-class');
  });
});
