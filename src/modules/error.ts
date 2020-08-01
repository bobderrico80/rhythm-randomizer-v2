export class InvalidNoteSelectionError extends Error {
  constructor() {
    super('This selection of notes is not valid');
  }
}
