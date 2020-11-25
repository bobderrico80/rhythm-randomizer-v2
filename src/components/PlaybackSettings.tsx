import React from 'react';
import classnames from 'classnames';
import { buildBemClassName } from '../modules/util';
import TempoControl, { TempoChangeHandler } from './TempoControl';
import './PlaybackSettings.scss';
import PitchControl, { PitchChangeHandler } from './PitchControl';
import { Pitch } from '../modules/tone';

export interface PlaybackSettingsProps {
  tempo: number;
  pitch: Pitch;
  onTempoChange: TempoChangeHandler;
  onPitchChange: PitchChangeHandler;
}

const buildClassName = buildBemClassName('c-rr-playback-settings');

const PlaybackSettings = ({
  tempo,
  pitch,
  onTempoChange,
  onPitchChange,
}: PlaybackSettingsProps) => {
  return (
    <section
      className={classnames('c-rr-settings-form__section', buildClassName()())}
    >
      <fieldset className={buildClassName('fieldset')()}>
        <TempoControl tempo={tempo} onTempoChange={onTempoChange} />
        <PitchControl pitch={pitch} onPitchChange={onPitchChange} />
      </fieldset>
    </section>
  );
};

export default PlaybackSettings;
