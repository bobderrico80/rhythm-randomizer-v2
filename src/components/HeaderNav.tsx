import React from 'react';
import classnames from 'classnames';
import { buildBemClassName } from '../modules/util';
import './HeaderNav.scss';

const buildClassName = buildBemClassName('c-rr-header-nav');

export interface HeaderNavProps {
  onRandomizeButtonClick: () => void;
}

const HeaderNav = ({ onRandomizeButtonClick }: HeaderNavProps) => {
  return (
    <nav className={buildClassName()()}>
      <ul>
        <li className={buildClassName('item')()}>
          <button
            className={classnames('c-rr-button', 'c-rr-button--dark')}
            onClick={onRandomizeButtonClick}
          >
            New Rhythm
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default HeaderNav;
