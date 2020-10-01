import React, { useState } from 'react';
import classnames from 'classnames';
import { buildBemClassName } from '../modules/util';
import './ShareButton.scss';

export interface ShareButtonProps {
  onShareSettingsClick: () => void;
}

const NOT_CLICKED_TEXT = 'Share Settings';
const CLICKED_TEXT = 'Share link copied to clipboard!';

const NOT_CLICKED_HOVER_TEXT = 'Click to copy share link to clipboard';
const CLICKED_HOVER_TEXT = 'Link Copied!';

const buildClassName = buildBemClassName('c-rr-share-button');

const ShareButton = ({ onShareSettingsClick }: ShareButtonProps) => {
  const [timeoutId, setTimeoutId] = useState<number | null>(null);
  const clicked = Boolean(timeoutId);
  const buttonText = clicked ? CLICKED_TEXT : NOT_CLICKED_TEXT;
  const hoverText = clicked ? CLICKED_HOVER_TEXT : NOT_CLICKED_HOVER_TEXT;

  const handleClick = () => {
    onShareSettingsClick();

    if (!timeoutId) {
      const id = window.setTimeout(() => {
        setTimeoutId(null);
      }, 5000);

      setTimeoutId(id);
    }
  };

  return (
    <button
      className={classnames(buildClassName()(), 'c-rr-button')}
      onClick={handleClick}
      disabled={clicked}
      title={hoverText}
    >
      {buttonText}
    </button>
  );
};

export default ShareButton;
