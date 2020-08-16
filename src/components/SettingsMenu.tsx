import React, { useEffect } from 'react';
import classnames from 'classnames';
import { buildBemClassName } from '../modules/util';
import IconButton from './IconButton';
import backArrowIcon from '../svg/back-arrow.svg';
import './SettingsMenu.scss';

const buildClassName = buildBemClassName('c-rr-settings-menu');
const buildPaneClassName = buildClassName('pane');
const buildFormClassName = buildClassName('form');
const buildOverlayClassName = buildClassName('overlay');

export interface SettingsMenuProps {
  settingsMenuOpen: boolean;
  onSettingsMenuCloseClick: () => void;
}

const SettingsMenu = ({
  settingsMenuOpen,
  onSettingsMenuCloseClick,
}: SettingsMenuProps) => {
  useEffect(() => {
    const escapePane = (event: KeyboardEvent) => {
      // If escape key is pressed...
      if (event.keyCode === 27) {
        onSettingsMenuCloseClick();
      }
    };

    document.addEventListener('keydown', escapePane);

    return () => {
      document.removeEventListener('keydown', escapePane);
    };
  }, [onSettingsMenuCloseClick]);

  return (
    <div
      className={classnames(buildClassName()(), {
        [buildClassName()('open')]: settingsMenuOpen,
      })}
      aria-hidden={!settingsMenuOpen}
    >
      <section
        className={classnames(buildPaneClassName(), {
          [buildPaneClassName('open')]: settingsMenuOpen,
        })}
      >
        <IconButton
          className={buildClassName('close-button')()}
          svg={backArrowIcon}
          alt="Close Settings Menu"
          onClick={onSettingsMenuCloseClick}
        />
        <form className={buildFormClassName()}>Form contents go here</form>
      </section>
      <div
        className={classnames(buildOverlayClassName(), {
          [buildOverlayClassName('open')]: settingsMenuOpen,
        })}
        onClick={onSettingsMenuCloseClick}
      />
    </div>
  );
};

export default SettingsMenu;
