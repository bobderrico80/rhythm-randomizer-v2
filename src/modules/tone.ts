import * as Tone from 'tone';
import { getTotalDuration, getPlaybackPatternsForNoteGroup, PlaybackPattern } from './note';
import { Measure } from './vex';

export enum PlaybackState {
  PLAYING,
  STOPPED
}

export type NoteTriggerHandler = (index: number | null) => void;

const NOTE_PITCH = 'F4';
const NOTE_SPACING = 0.85; // %
const TRAILING_TIME = 1; // seconds

let initialized = false;
let synth: Tone.Synth | null = null;

export const Transport = Tone.Transport;

const init = () => {
  if (!initialized) {
    synth = new Tone.Synth().toDestination();
    synth.envelope.decay = 20;
    synth.envelope.sustain = 0.1;
    initialized = true;
  }
}

export const startPlayback = () => {
  Tone.start();
  Transport.start();
}

export const stopPlayback = () => {
  Transport.stop();
}

export const setTempo = (tempo: number) => {
  Transport.bpm.value = tempo;
}

const triggerNote = (playbackPattern: PlaybackPattern, index: number, onNoteTrigger: NoteTriggerHandler) => {
  return (time: number) => {
    onNoteTrigger(index);
    if (synth) {
      if (!playbackPattern.rest) {
        synth.triggerAttackRelease(
          NOTE_PITCH,
          Tone.Time(playbackPattern.toneDuration).valueOf() * NOTE_SPACING,
          time
        )
      }
    } else {
      init();
      triggerNote(playbackPattern, index, onNoteTrigger);
    }
  }
}

export const scheduleMeasures = (measures: Measure[], onNoteTrigger: NoteTriggerHandler) => {
  if (!initialized) {
    init();
  }

  Transport.cancel();

  let elapsedTime = 0;

  if (measures.length === 0) {
    return;
  }

  let playbackPatternIndex = 0;

  measures.forEach((measure) => {
    if (getTotalDuration(measure.noteGroups) === 0) {
      return;
    }

    measure.noteGroups.forEach((noteGroup) => {
      const playbackPatterns = getPlaybackPatternsForNoteGroup(noteGroup);

      if (playbackPatterns.length === 0) {
        return;
      }

      playbackPatterns.forEach((playbackPattern) => {
        Transport.schedule(triggerNote(playbackPattern, playbackPatternIndex, onNoteTrigger), elapsedTime)
        elapsedTime += Tone.Time(playbackPattern.toneDuration).toSeconds();
        playbackPatternIndex += 1;
      });
    });
  });

  Transport.schedule(() => onNoteTrigger(null), elapsedTime)
  elapsedTime += TRAILING_TIME;
  Transport.schedule(stopPlayback, elapsedTime);
}
