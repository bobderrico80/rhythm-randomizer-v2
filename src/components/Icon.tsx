import React from 'react';
import classnames from 'classnames';

export interface IconProps {
  svg: string;
  alt: string;
  className?: string;
}

const Icon = ({ svg, alt, className = '' }: IconProps) => {
  return (
    <img src={svg} alt={alt} className={classnames('c-rr-icon', className)} />
  );
};

export default Icon;
