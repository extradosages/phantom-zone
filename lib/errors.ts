/**
 * An error with suitable verbosity to satisfy the high standards of this application.
 */
export class ErrorWithContext extends Error {
  context?: Record<string, unknown>;

  hints?: string[];

  constructor(
    message?: string,
    context?: Record<string, unknown>,
    hints?: string[]
  ) {
    super(message);
    this.context = context;
    this.hints = hints;
  }
}

/**
 * Throw an `ErrorWithContext`.
 *
 * @param message
 * @param context
 * @param hints
 */
export const error = (
  message?: string,
  context?: Record<string, unknown>,
  hints?: string[]
): never => {
  throw new ErrorWithContext(message, context, hints);
};
