'use strict';

export class BlastError extends Error {
  public reason: string;
  constructor(message: string, reason: string) {
    super(message);
    this.reason = reason || '';
  }
}
