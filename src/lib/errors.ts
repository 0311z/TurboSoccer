export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly userMessage: string,
    public readonly traceId: string,
    public override readonly cause: unknown,
  ) { super(userMessage); this.name = 'AppError'; }
}
