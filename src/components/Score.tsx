import React, { useEffect, useRef } from 'react';
import Vex from 'vexflow';
import { NoteDefinition } from '../modules/note';
import './Score.scss';
import { TimeSignatureDefinition } from '../modules/time-signature';

const VF = Vex.Flow;

export interface ScoreProps {
  timeSignature: TimeSignatureDefinition;
  measures: NoteDefinition[][];
  measuresPerStaff: number;
}

interface Note {
  notes: string[];
  beam?: boolean;
  tuplet?: boolean;
}

const Score = ({ timeSignature, measures, measuresPerStaff }: ScoreProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ref = containerRef;

    if (!ref) {
      return;
    }

    const PADDING_TOP = 40;
    const PADDING_RIGHT = 10;
    const PADDING_BOTTOM = 40;
    const PADDING_LEFT = 10;
    const SYSTEM_OFFSET = 150;
    const MEASURE_WIDTH = 300;
    const MEASURES_PER_SYSTEM = 4;

    let beams: Vex.Flow.Beam[] = [];
    let tuplets: Vex.Flow.Tuplet[] = [];

    const makeNotes = (...notes: Note[]) => {
      return notes.flatMap((note) => {
        const notes = note.notes.map((note) => {
          let addDot = false;

          if (note.endsWith('.')) {
            addDot = true;
            note = note.replace('.', '');
          }

          const staveNote = new VF.StaveNote({
            clef: 'percussion',
            keys: ['b/4'],
            duration: note,
            stem_direction: VF.Stem.UP,
            auto_stem: false,
          });

          // Center the whole rest
          if (note === 'wr') {
            staveNote.setXShift(MEASURE_WIDTH * 0.43);
          }

          if (addDot) {
            staveNote.addDot(0);
          }

          return staveNote;
        });

        if (note.beam) {
          beams.push(new VF.Beam(notes, false));
        }

        if (note.tuplet) {
          tuplets.push(new VF.Tuplet(notes));
        }

        return notes;
      });
    };

    const createScore = (measures: Note[][]) => {
      const canvasWidth =
        PADDING_LEFT + MEASURE_WIDTH * MEASURES_PER_SYSTEM + PADDING_RIGHT;
      const numberOfSystems = Math.ceil(measures.length / MEASURES_PER_SYSTEM);
      const canvasHeight =
        PADDING_TOP + SYSTEM_OFFSET * numberOfSystems + PADDING_BOTTOM;

      const renderer = new VF.Renderer(ref.current!, VF.Renderer.Backends.SVG);
      renderer.resize(canvasWidth, canvasHeight);

      const context = renderer.getContext();

      measures.forEach((measure, index) => {
        beams = [];
        tuplets = [];
        const measureInSystem = index % MEASURES_PER_SYSTEM;
        const xOffset = PADDING_LEFT + MEASURE_WIDTH * measureInSystem;
        const currentSystem = Math.floor(
          index / measures.length / (MEASURES_PER_SYSTEM / measures.length)
        );

        const yOffset = PADDING_TOP + SYSTEM_OFFSET * currentSystem;

        const staff = new VF.Stave(xOffset, yOffset, MEASURE_WIDTH);

        if (measureInSystem === 0) {
          staff.setBegBarType(VF.Barline.type.NONE);
          staff.addClef('percussion');
        }

        if (index === 0) {
          staff.addTimeSignature('4/4');
        }

        staff
          .setConfigForLine(0, { visible: false })
          .setConfigForLine(1, { visible: false })
          .setConfigForLine(2, { visible: true })
          .setConfigForLine(3, { visible: false })
          .setConfigForLine(4, { visible: false });

        if (index === measures.length - 1) {
          staff.setEndBarType(VF.Barline.type.END);
        }

        staff.setContext(context).draw();

        const notes = makeNotes(...measure);

        VF.Formatter.FormatAndDraw(context, staff, notes);
        beams.forEach((b) => b.setContext(context).draw());
        tuplets.forEach((t) => t.setContext(context).draw());
      });
    };

    const q = { notes: ['q'] };
    const ee = { notes: ['8', '8'], beam: true };
    const h = { notes: ['h'] };
    const w = { notes: ['w'] };
    const qr = { notes: ['qr'] };
    const hr = { notes: ['hr'] };
    const wr = { notes: ['wr'] };
    const hd = { notes: ['h.'] };
    const ssss = { notes: ['16', '16', '16', '16'], beam: true };
    const ess = { notes: ['8', '16', '16'], beam: true };
    const teee = { notes: ['8', '8', '8'], beam: true, tuplet: true };
    const tqqq = { notes: ['4', '4', '4'], tuplet: true };
    const eqe = { notes: ['8', '4', '8'] };

    const measures: Note[][] = [
      [q, q, ee, q],
      [tqqq, hr],
      [q, qr, h],
      [hd, qr],
      [q, ssss, teee, q],
      [qr, ess, eqe],
      [wr],
      [w],
    ];

    createScore(measures);

    return () => {
      if (ref && ref.current) {
        ref.current.innerHTML = '';
      }
    };
  }, [timeSignature, measures, measuresPerStaff]);

  return <div id="score" ref={containerRef} />;
};

export default Score;
