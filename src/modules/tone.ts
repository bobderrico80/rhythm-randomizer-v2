import * as Tone from 'tone';
import { getTotalDuration, getPlaybackPatternsForNoteGroup } from './note';
import { Measure } from './vex';

export enum PlaybackState {
  PLAYING,
  STOPPED
}

const NOTE_PITCH = 'F4';
const NOTE_SPACING = 0.85; // %
const TRAILING_TIME = 1; // seconds
const TEMPO = 80 // bpm

let initialized = false;
let synth: Tone.Synth | null = null;

export const Transport = Tone.Transport;

const init = () => {
  if (!initialized) {
    synth = new Tone.Synth().toDestination();
    synth.envelope.decay = 20;
    synth.envelope.sustain = 0.1;
    Transport.bpm.value = TEMPO;
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

const triggerNote = (toneDuration: string) => {
  return (time: number) => {
    if (synth) {
      synth.triggerAttackRelease(
        NOTE_PITCH,
        Tone.Time(toneDuration).valueOf() * NOTE_SPACING,
        time
      )
    } else {
      init();
      triggerNote(toneDuration);
    }
  }
}

export const scheduleMeasures = (measures: Measure[]) => {
  if (!initialized) {
    init();
  }

  Transport.cancel();

  let elapsedTime = 0;

  if (measures.length === 0) {
    return;
  }

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
        if (!playbackPattern.rest) {
          Transport.schedule(triggerNote(playbackPattern.toneDuration), elapsedTime)
        }

        elapsedTime += Tone.Time(playbackPattern.toneDuration).toSeconds();
      });
    });
  });

  elapsedTime += TRAILING_TIME;
  Transport.schedule(stopPlayback, elapsedTime);
}
