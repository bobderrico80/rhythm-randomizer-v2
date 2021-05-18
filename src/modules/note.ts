import { Map } from 'immutable';
import {
  NoteGroup,
  CategorizedNoteGroup,
  NoteGroupCategoryType,
  NoteGroupCategory,
  noteGroupCategories,
  NoteGroupTypeSelectionMap,
  noteGroups,
  NoteGroupType,
  GeneratedNoteGroup,
  PlaybackPattern,
} from './note-definition';
import { getDuration, randomizeNoteSubGroups } from './random';
import { TimeSignature, TimeSignatureComplexity } from './time-signature';
import { findItemOfType, categorizeItems } from './util';

export const categorizeNoteGroups = (
  noteGroups: NoteGroup[]
): CategorizedNoteGroup[] => {
  return categorizeItems<
    NoteGroupCategoryType,
    NoteGroupCategory,
    NoteGroup,
    CategorizedNoteGroup
  >(noteGroups, noteGroupCategories);
};

export const getNoteGroupTypeSelectionMap = (): NoteGroupTypeSelectionMap => {
  const noteGroupSelections = noteGroups.reduce((accumulator, noteGroup) => {
    accumulator[noteGroup.type] = noteGroup.defaultSelectionValue;
    return accumulator;
  }, {} as { [key: string]: boolean });
  return Map(noteGroupSelections) as NoteGroupTypeSelectionMap;
};

export const resetNoteGroupTypeSelectionMap = (
  noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap
) => {
  return noteGroupTypeSelectionMap.reduce(
    (previousNoteGroupTypeSelectionMap, _, noteGroupType) => {
      return previousNoteGroupTypeSelectionMap.set(noteGroupType, false);
    },
    noteGroupTypeSelectionMap
  );
};

export const setNoteGroupTypeSelections = (
  noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap,
  reset: boolean,
  ...noteGroupTypes: NoteGroupType[]
) => {
  if (reset) {
    noteGroupTypeSelectionMap = resetNoteGroupTypeSelectionMap(
      noteGroupTypeSelectionMap
    );
  }

  noteGroupTypes.forEach((noteGroupType) => {
    noteGroupTypeSelectionMap = noteGroupTypeSelectionMap.set(
      noteGroupType,
      true
    );
  });

  return noteGroupTypeSelectionMap;
};

export const getNoteGroup = (type: NoteGroupType): NoteGroup => {
  return findItemOfType<NoteGroupType, NoteGroup>(type, noteGroups);
};

export const getNoteGroupCategory = (
  type: NoteGroupCategoryType
): NoteGroupCategory => {
  return findItemOfType<NoteGroupCategoryType, NoteGroupCategory>(
    type,
    noteGroupCategories
  );
};

export const getNoteGroups = (...types: NoteGroupType[]): NoteGroup[] => {
  return types.map(getNoteGroup);
};

export const generateNoteGroup = (
  noteGroup: NoteGroup,
  timeSignature: TimeSignature,
  testMode: boolean = false
): GeneratedNoteGroup => {
  // TODO: Handle Asymmetrical meters
  if (timeSignature.complexity === TimeSignatureComplexity.ASYMMETRICAL) {
    return {
      duration: 1,
      notes: [],
      type: NoteGroupType.H,
    };
  }

  let generatedNoteGroup: GeneratedNoteGroup;

  if (noteGroup.notes) {
    generatedNoteGroup = {
      type: noteGroup.type,
      duration: getDuration(noteGroup, timeSignature.beatsPerMeasure),
      notes: noteGroup.notes,
    };
  } else {
    const randomizedNotes = randomizeNoteSubGroups(noteGroup, testMode);

    generatedNoteGroup = {
      type: noteGroup.type,
      duration: getDuration(noteGroup, timeSignature.beatsPerMeasure),
      notes: randomizedNotes,
    };
  }

  if (noteGroup.beam) {
    if (typeof noteGroup.beam === 'function') {
      generatedNoteGroup.beam = noteGroup.beam(generatedNoteGroup.notes);
    } else {
      generatedNoteGroup.beam = true;
    }
  }

  if (noteGroup.tuplet) {
    generatedNoteGroup.tuplet = true;
  }

  return generatedNoteGroup;
};

export const generateNoteGroups = (
  noteGroups: NoteGroup[],
  timeSignature: TimeSignature,
  testMode: boolean = false
): GeneratedNoteGroup[] => {
  return noteGroups.map((noteGroup) =>
    generateNoteGroup(noteGroup, timeSignature, testMode)
  );
};

export const getGeneratedNoteGroup = (
  type: NoteGroupType,
  timeSignature: TimeSignature
): GeneratedNoteGroup => {
  const noteGroup = getNoteGroup(type);
  return generateNoteGroup(noteGroup, timeSignature);
};

export const getGeneratedNoteGroups = (
  timeSignature: TimeSignature,
  ...types: NoteGroupType[]
): GeneratedNoteGroup[] => {
  return types.map((noteGroupType) =>
    getGeneratedNoteGroup(noteGroupType, timeSignature)
  );
};

export const getTotalDuration = (noteGroups: GeneratedNoteGroup[]): number => {
  return noteGroups.reduce((sum, noteGroup) => {
    return sum + noteGroup.duration;
  }, 0);
};

export const isValidNoteGroupForTimeSignature = (
  noteGroup: NoteGroup,
  timeSignature: TimeSignature
): boolean => {
  // TODO: Handle Asymmetrical meters
  if (timeSignature.complexity === TimeSignatureComplexity.ASYMMETRICAL) {
    return false;
  }

  const duration = getDuration(noteGroup, timeSignature.beatsPerMeasure);

  let timeSignatureComplexityMatches;

  if (
    timeSignature.complexity === TimeSignatureComplexity.SIMPLE ||
    timeSignature.complexity === TimeSignatureComplexity.ALLA_BREVE
  ) {
    timeSignatureComplexityMatches =
      noteGroup.timeSignatureComplexity === TimeSignatureComplexity.SIMPLE;
  } else {
    timeSignatureComplexityMatches =
      noteGroup.timeSignatureComplexity === timeSignature.complexity;
  }
  return (
    duration <= timeSignature.beatsPerMeasure && timeSignatureComplexityMatches
  );
};

export const getSelectedNoteGroupTypes = (
  noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap,
  timeSignature: TimeSignature
) => {
  return [...noteGroupTypeSelectionMap.entries()].reduce(
    (previousNoteGroupTypes, [noteGroupType, checked]) => {
      // Exclude notes that were not selected
      if (!checked) {
        return previousNoteGroupTypes;
      }

      const noteGroup = getNoteGroup(noteGroupType);

      // Exclude notes that don't match with the current time signature
      if (!isValidNoteGroupForTimeSignature(noteGroup, timeSignature)) {
        return previousNoteGroupTypes;
      }

      previousNoteGroupTypes.push(noteGroupType);

      return previousNoteGroupTypes;
    },
    [] as NoteGroupType[]
  );
};

/**
 * Implementation note:
 * Compound time signatures are "converted" into simple time signature rhythms for playback,
 * applying the following algorithm:
 * - Non-tupleted notes (like 3 beamed 8th notes) are converted into tuplets (3-8th note triplet)
 * - Dotted notes (like a dotted half note) have the dot removed (a half note)
 * - Tupleted notes (like a an 8th note duplet) are converted into regular notes (2-8th notes)
 *
 * @param noteGroup {NoteGroup}
 * @param timeSignature {TimeSignature}
 * @return {PlaybackPattern[]}
 */
export const getPlaybackPatternsForNoteGroup = (
  noteGroup: GeneratedNoteGroup,
  timeSignature: TimeSignature
): PlaybackPattern[] => {
  return noteGroup.notes.map((note) => {
    let unit = '';
    let dotIndicator = '';

    switch (timeSignature.complexity) {
      case TimeSignatureComplexity.SIMPLE:
      case TimeSignatureComplexity.ALLA_BREVE:
        if (note.dotted && noteGroup.tuplet) {
          unit = 'n';
          dotIndicator = '';
        } else if (note.dotted) {
          unit = 'n';
          dotIndicator = '.';
        } else if (noteGroup.tuplet) {
          unit = 't';
          dotIndicator = '';
        } else {
          unit = 'n';
          dotIndicator = '';
        }
        break;
      case TimeSignatureComplexity.COMPOUND:
        if (note.dotted && noteGroup.tuplet) {
          unit = 't';
          dotIndicator = '';
        } else if (note.dotted) {
          unit = 'n';
          dotIndicator = '';
        } else if (noteGroup.tuplet) {
          unit = 'n';
          dotIndicator = '';
        } else {
          unit = 't';
          dotIndicator = '';
        }
        break;
    }

    let resolvedPlaybackUnit = note.playbackUnit;

    if (timeSignature.complexity === TimeSignatureComplexity.ALLA_BREVE) {
      resolvedPlaybackUnit = (parseInt(note.playbackUnit) * 2).toString();
    }

    const toneDuration = `${resolvedPlaybackUnit}${unit}${dotIndicator}`;

    return {
      toneDuration,
      rest: note.rest,
    };
  });
};
