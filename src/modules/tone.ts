import * as Tone from 'tone';
import { getMetronomePlaybackPatterns, MetronomeSettings } from './metronome';
import {
  getTotalDuration,
  getPlaybackPatternsForNoteGroup,
  PlaybackPattern,
  Pitch,
} from './note';
import { TimeSignature } from './time-signature';
import { Measure } from './vex';

export enum PlaybackState {
  PLAYING,
  STOPPED,
}
export type NoteTriggerHandler = (index: number | null) => void;

const NOTE_SPACING = 0.75; // %
const HEADING_TIME = 0.1; // seconds
const TRAILING_TIME = 1; // seconds

export const Transport = Tone.Transport;

const getPlaybackSynth = () => {
  const synth = new Tone.Synth().toDestination();

  synth.envelope.decay = 20;
  synth.envelope.sustain = 0.1;

  return synth;
};

const getMetronomeSynth = () => {
  const synth = new Tone.Synth().toDestination();

  synth.envelope.attack = 0.005;
  synth.envelope.decay = 0.05;
  synth.envelope.sustain = 0;
  synth.envelope.release = 0;

  return synth;
};

export const startPlayback = (
  measures: Measure[],
  pitch: Pitch,
  timeSignature: TimeSignature,
  metronomeSettings: MetronomeSettings,
  onNoteTrigger: NoteTriggerHandler,
  onMetronomeClickTrigger: NoteTriggerHandler
) => {
  Tone.start();
  Transport.cancel();

  Transport.timeSignature = timeSignature.beatsPerMeasure;

  let elapsedTime = HEADING_TIME;

  if (metronomeSettings.active) {
    scheduleMetronomeMeasures(
      measures.length + metronomeSettings.countOffMeasures,
      getMetronomeSynth(),
      elapsedTime,
      timeSignature,
      metronomeSettings,
      onMetronomeClickTrigger
    );

    if (metronomeSettings.countOffMeasures) {
      elapsedTime += Tone.Time(
        `${metronomeSettings.countOffMeasures}m`
      ).toSeconds();
    }
  }

  scheduleMeasures(
    elapsedTime,
    getPlaybackSynth(),
    measures,
    pitch,
    timeSignature,
    onNoteTrigger
  );
  Transport.start();
};

export const stopPlayback = () => {
  Transport.stop();
};

export const updateTempo = (tempo: number) => {
  Transport.bpm.value = tempo;
};

const getPitchString = (pitch: Pitch) => {
  return `${pitch.pitchClass}${pitch.octave}`;
};

const triggerNote = (
  synth: Tone.Synth,
  playbackPattern: PlaybackPattern,
  index: number,
  pitch: Pitch,
  onNoteTrigger: NoteTriggerHandler
) => {
  return (time: number) => {
    onNoteTrigger(index);
    if (!playbackPattern.rest) {
      synth.triggerAttackRelease(
        getPitchString(pitch),
        Tone.Time(playbackPattern.toneDuration).valueOf() * NOTE_SPACING,
        time
      );
    }
  };
};

const scheduleMeasures = (
  elapsedTime: number,
  synth: Tone.Synth,
  measures: Measure[],
  pitch: Pitch,
  timeSignature: TimeSignature,
  onNoteTrigger: NoteTriggerHandler
) => {
  if (measures.length === 0) {
    return;
  }

  let playbackPatternIndex = 0;

  measures.forEach((measure) => {
    if (getTotalDuration(measure.noteGroups) === 0) {
      return;
    }

    measure.noteGroups.forEach((noteGroup) => {
      const playbackPatterns = getPlaybackPatternsForNoteGroup(
        noteGroup,
        timeSignature
      );

      if (playbackPatterns.length === 0) {
        return;
      }

      playbackPatterns.forEach((playbackPattern) => {
        Transport.schedule(
          triggerNote(
            synth,
            playbackPattern,
            playbackPatternIndex,
            pitch,
            onNoteTrigger
          ),
          elapsedTime
        );
        elapsedTime += Tone.Time(playbackPattern.toneDuration).toSeconds();
        playbackPatternIndex += 1;
      });
    });
  });

  Transport.schedule(() => onNoteTrigger(null), elapsedTime);
  elapsedTime += TRAILING_TIME;
  Transport.schedule(stopPlayback, elapsedTime);
};

const scheduleMetronome = (
  synth: Tone.Synth,
  elapsedTime: number,
  timeSignature: TimeSignature,
  metronomeSettings: MetronomeSettings,
  scheduleNext: boolean,
  onMetronomeClickTrigger: NoteTriggerHandler
) => {
  const playbackPatterns = getMetronomePlaybackPatterns(
    timeSignature,
    metronomeSettings
  );

  playbackPatterns.forEach((playbackPattern, index) => {
    if (playbackPattern.pitch) {
      Transport.schedule(
        triggerNote(
          synth,
          playbackPattern,
          index,
          playbackPattern.pitch,
          (i) => {
            // Schedule next measure of clicks if scheduling last click
            if (scheduleNext && i === playbackPatterns.length - 1) {
              scheduleMetronome(
                synth,
                elapsedTime,
                timeSignature,
                metronomeSettings,
                true,
                onMetronomeClickTrigger
              );
            }

            onMetronomeClickTrigger(i);
          }
        ),
        elapsedTime
      );
    }

    elapsedTime += Tone.Time(playbackPattern.toneDuration).toSeconds();
  });

  return elapsedTime;
};

const scheduleMetronomeMeasures = (
  measureCount: number,
  synth: Tone.Synth,
  elapsedTime: number,
  timeSignature: TimeSignature,
  metronomeSettings: MetronomeSettings,
  onMetronomeClickTrigger: NoteTriggerHandler
) => {
  for (let count = 0; count < measureCount; count++) {
    elapsedTime = scheduleMetronome(
      synth,
      elapsedTime,
      timeSignature,
      metronomeSettings,
      false,
      onMetronomeClickTrigger
    );
  }
};

export const startMetronome = (
  timeSignature: TimeSignature,
  metronomeSettings: MetronomeSettings,
  onMetronomeClickTrigger: NoteTriggerHandler
) => {
  Tone.start();
  Transport.cancel();

  scheduleMetronome(
    getMetronomeSynth(),
    HEADING_TIME,
    timeSignature,
    metronomeSettings,
    true,
    onMetronomeClickTrigger
  );

  Transport.start();
};

export const stopMetronome = () => {
  Transport.stop();
  Transport.cancel();
};
