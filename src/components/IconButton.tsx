import React, { MouseEvent } from 'react';
import classnames from 'classnames';
import './IconButton.scss';
import Icon, { IconProps } from './Icon';

export interface IconButtonProps extends IconProps {
  id?: string;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}

const IconButton = ({
  svg,
  alt,
  className = '',
  id,
  onClick,
  ...rest
}: IconButtonProps) => {
  return (
    <button
      type="button"
      id={id}
      className={classnames('e-rr-button', 'c-rr-icon-button', className)}
      onClick={onClick}
      {...rest}
    >
      <Icon svg={svg} alt={alt} className="c-rr-icon-button__icon" />
    </button>
  );
};

export default IconButton;
