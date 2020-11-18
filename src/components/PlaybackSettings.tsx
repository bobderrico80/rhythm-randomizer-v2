import React from 'react';
import classnames from 'classnames';
import { buildBemClassName } from '../modules/util';
import TempoControl, { TempoChangeHandler } from './TempoControl';
import './PlaybackSettings.scss';

export interface PlaybackSettingsProps {
  tempo: number;
  onTempoChange: TempoChangeHandler;
}

const buildClassName = buildBemClassName('c-rr-playback-settings');

const PlaybackSettings = ({ tempo, onTempoChange }: PlaybackSettingsProps) => {
  return (
    <section
      className={classnames('c-rr-settings-form__section', buildClassName()())}
    >
      <fieldset className={buildClassName('fieldset')()}>
        <TempoControl tempo={tempo} onTempoChange={onTempoChange} />
      </fieldset>
    </section>
  );
};

export default PlaybackSettings;
