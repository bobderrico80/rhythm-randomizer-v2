import React from 'react';
import classnames from 'classnames';
import Openable from './Openable';
import { buildBemClassName } from '../modules/util';
import menuIcon from '../svg/menu.svg';
import backArrowIcon from '../svg/back-arrow.svg';
import './SettingsMenu.scss';

const buildClassName = buildBemClassName('c-rr-settings-menu');
const buildContainerClassName = buildClassName('container');
const buildPaneClassName = buildClassName('pane');
const buildButtonIconClassName = buildClassName('button-icon');

export interface SettingsMenuProps {}

const SettingsMenu = ({}: SettingsMenuProps) => {
  const renderButtonContents = (open: boolean) => {
    const icon = open ? backArrowIcon : menuIcon;
    const alt = open ? 'Close Settings Menu' : 'Open Settings Menu';

    return (
      <img
        src={icon}
        alt={alt}
        className={classnames(buildButtonIconClassName(), {
          [buildButtonIconClassName('open')]: open,
          [buildButtonIconClassName('closed')]: !open,
        })}
      />
    );
  };

  const renderPaneContents = () => {
    return <form>Settings menu stuff goes here</form>;
  };

  return (
    <section className={buildClassName()()}>
      <Openable
        renderButtonContents={renderButtonContents}
        renderPaneContents={renderPaneContents}
        buttonClassName={buildClassName('button')()}
        containerClassName={buildContainerClassName()}
        openContainerClassName={buildContainerClassName('open')}
        closedContainerClassName={buildContainerClassName('closed')}
        paneClassName={buildPaneClassName()}
        openPaneClassName={buildPaneClassName('open')}
        closedPaneClassName={buildPaneClassName('closed')}
        autoClose={false}
      />
    </section>
  );
};

export default SettingsMenu;
