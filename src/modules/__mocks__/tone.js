export const Transport = {
  off: jest.fn(),
  on: jest.fn(),
  bpm: { value: 120 },
};

export const startPlayback = jest.fn();

export const stopPlayback = jest.fn();

export const updateTempo = jest.fn();
