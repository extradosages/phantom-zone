/**
 * An error with suitable verbosity to satisfy the high standards of this application.
 */
export class ErrorWithContext extends Error {
  context?: Record<string, unknown>;

  hints?: string[];

  constructor(context: Record<string, unknown>, message: string = "") {
    super(message);
    this.context = context;
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
  context: Record<string, unknown>,
  message?: string
): never => {
  throw new ErrorWithContext(context, message);
};
