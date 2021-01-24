import React from 'react';
import classnames from 'classnames';
import { buildBemClassName } from '../modules/util';
import './Checkbox.scss';

const buildClassName = buildBemClassName('c-rr-checkbox');

export interface CheckboxProps {
  id: string;
  checked: boolean;
  renderLabel: (checked: boolean) => JSX.Element;
  className?: string;
  labelClassName?: string;
  onChange: (checked: boolean, id: string) => void;
}

const Checkbox = ({
  id,
  checked,
  renderLabel,
  className = '',
  labelClassName = '',
  onChange,
}: CheckboxProps) => {
  const handleChange = (event: React.FormEvent<HTMLInputElement>) => {
    onChange(event.currentTarget.checked, id);
  };

  return (
    <label
      htmlFor={id}
      className={classnames(buildClassName('label')(), labelClassName)}
    >
      <input
        type="checkbox"
        id={id}
        name={id}
        className={classnames(buildClassName()(), className)}
        checked={checked}
        onChange={handleChange}
      />
      {renderLabel(checked)}
    </label>
  );
};

export default Checkbox;
