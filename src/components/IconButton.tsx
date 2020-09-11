import React from 'react';
import classnames from 'classnames';
import './IconButton.scss';

export interface IconButtonProps {
  svg: string;
  alt: string;
  className?: string;
  id?: string;
  onClick: () => void;
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
      id={id}
      className={classnames('e-rr-button', 'c-rr-icon-button', className)}
      onClick={onClick}
      {...rest}
    >
      <img src={svg} alt={alt} className="c-rr-icon-button__icon" title={alt} />
    </button>
  );
};

export default IconButton;
