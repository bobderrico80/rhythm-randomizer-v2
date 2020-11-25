import React, { FormEvent } from 'react';
import classnames from 'classnames';
import { buildBemClassName } from '../modules/util';
import './Select.scss';

export interface SelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (changedValue: string) => void;
  options: { value: string; display: string }[];
  className?: string;
}

const buildClassName = buildBemClassName('c-rr-select');

const Select = ({
  id,
  label,
  value,
  onChange,
  options,
  className = '',
}: SelectProps) => {
  const handleChange = (event: FormEvent<HTMLSelectElement>) => {
    onChange(event.currentTarget.value);
  };

  return (
    <div
      className={classnames(
        className,
        buildClassName()(),
        buildClassName()(id)
      )}
    >
      <label
        htmlFor={id}
        className={classnames(
          buildClassName('label')(),
          buildClassName('label')(id)
        )}
      >
        {label}
        <select
          id={id}
          className={classnames(
            buildClassName('dropdown')(),
            buildClassName('dropdown')(id)
          )}
          onChange={handleChange}
          value={value}
        >
          {options.map(({ value, display }) => {
            return (
              <option value={value} key={value}>
                {display}
              </option>
            );
          })}
        </select>
      </label>
    </div>
  );
};

export default Select;
