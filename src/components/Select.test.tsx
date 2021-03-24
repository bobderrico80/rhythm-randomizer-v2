import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Select from './Select';

describe('The <Select /> component', () => {
  let select: HTMLSelectElement;
  let changeHandler: jest.Mock;

  beforeEach(() => {
    changeHandler = jest.fn();
    render(
      <Select
        id="test"
        label="Test"
        value="1"
        onChange={changeHandler}
        options={[
          { value: '1', display: 'foo' },
          { value: '2', display: 'bar' },
        ]}
        className="test-class"
      />
    );

    select = screen.getByRole('combobox') as HTMLSelectElement;
  });

  it('renders a <select /> with the provided `label` value', () => {
    expect(select.parentElement).toHaveTextContent('Test');
  });

  it('renders a <select /> with the provided `options`', () => {
    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveValue('1');
    expect(options[0]).toHaveTextContent('foo');
    expect(options[1]).toHaveValue('2');
    expect(options[1]).toHaveTextContent('bar');
  });

  it('passes the provided `value` to the <select />', () => {
    expect(select).toHaveValue('1');
  });

  it('renders the component container with the provided `className`', () => {
    expect(select.parentElement?.parentElement).toHaveClass('test-class');
  });

  it('calls the `onChange` handler with the selected value when selected', () => {
    userEvent.selectOptions(select, '2');
    expect(changeHandler).toHaveBeenCalledWith('2');
  });
});
