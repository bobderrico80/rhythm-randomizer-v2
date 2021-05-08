import { Octave, Pitch, PitchClass, PlaybackPattern } from './note-definition';
import { TimeSignature, TimeSignatureComplexity } from './time-signature';
import { duplicate, findItemOfType, TypedItem } from './util';

export enum ClickType {
  MAIN,
  MEASURE,
  SUBDIVISION,
}

export interface Click extends TypedItem<ClickType> {
  type: ClickType;
  pitch: Pitch;
  velocity: number;
}

export interface MetronomeSettings {
  active: boolean;
  startOfMeasureClick: boolean;
  subdivisionClick: boolean;
  countOffMeasures: number;
}

const clicks: Click[] = [
  {
    type: ClickType.MAIN,
    pitch: {
      pitchClass: PitchClass.F,
      octave: Octave._6,
    },
    velocity: 0.8,
  },
  {
    type: ClickType.MEASURE,
    pitch: {
      pitchClass: PitchClass.Bb,
      octave: Octave._6,
    },
    velocity: 1,
  },
  {
    type: ClickType.SUBDIVISION,
    pitch: {
      pitchClass: PitchClass.D,
      octave: Octave._7,
    },
    velocity: 0.25,
  },
];

export const getClick = (type: ClickType): Click =>
  findItemOfType<ClickType, Click>(type, clicks);

const clickToPlaybackPattern = (
  click: Click,
  toneDuration: string
): PlaybackPattern => {
  return {
    toneDuration,
    rest: false,
    pitch: click.pitch,
    velocity: click.velocity,
  };
};

export const getMetronomePlaybackPatterns = (
  timeSignature: TimeSignature,
  metronomeSettings: MetronomeSettings
): PlaybackPattern[] => {
  const mainClick = getClick(ClickType.MAIN);
  const measureClick = metronomeSettings.startOfMeasureClick
    ? getClick(ClickType.MEASURE)
    : mainClick;
  const subClick = getClick(ClickType.SUBDIVISION);
  const isCompound =
    timeSignature.complexity === TimeSignatureComplexity.COMPOUND;
  const subClicksToAdd = isCompound ? 2 : 1;

  let toneDuration: string;
  if (!metronomeSettings.subdivisionClick) {
    toneDuration = '4n';
  } else if (timeSignature.complexity === TimeSignatureComplexity.COMPOUND) {
    toneDuration = '8t';
  } else {
    toneDuration = '8n';
  }

  const playbackPatterns: PlaybackPattern[] = [];

  playbackPatterns.push(clickToPlaybackPattern(measureClick, toneDuration));

  if (metronomeSettings.subdivisionClick) {
    playbackPatterns.push(
      ...duplicate(
        clickToPlaybackPattern(subClick, toneDuration),
        subClicksToAdd
      )
    );
  }

  let resolvedBeatsPerMeasure = timeSignature.beatsPerMeasure;
  if (timeSignature.complexity === TimeSignatureComplexity.ALLA_BREVE) {
    resolvedBeatsPerMeasure = timeSignature.beatsPerMeasure / 2;
  }

  for (let i = 1; i < resolvedBeatsPerMeasure; i++) {
    playbackPatterns.push(clickToPlaybackPattern(mainClick, toneDuration));

    if (metronomeSettings.subdivisionClick) {
      playbackPatterns.push(
        ...duplicate(
          clickToPlaybackPattern(subClick, toneDuration),
          subClicksToAdd
        )
      );
    }
  }

  return playbackPatterns;
};
