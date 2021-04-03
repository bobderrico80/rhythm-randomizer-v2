import React, { useState } from 'react';
import classnames from 'classnames';
import { buildBemClassName } from '../modules/util';
import './ShareButton.scss';
import { useTranslation } from 'react-i18next';

export interface ShareButtonProps {
  onShareSettingsClick: () => void;
}

const NOT_CLICKED_TEXT = 'shareSettings';
const CLICKED_TEXT = 'shareLinkCopiedToClipboard';

const NOT_CLICKED_HOVER_TEXT = 'clickToCopyShareLinkToClipboard';
const CLICKED_HOVER_TEXT = 'linkCopied';

const buildClassName = buildBemClassName('c-rr-share-button');

const ShareButton = ({ onShareSettingsClick }: ShareButtonProps) => {
  const { t } = useTranslation();

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
      type="button"
      className={classnames(buildClassName()(), 'c-rr-button')}
      onClick={handleClick}
      disabled={clicked}
      title={t(hoverText)}
    >
      {t(buttonText)}
    </button>
  );
};

export default ShareButton;
