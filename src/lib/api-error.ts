// src/lib/api-error.ts

export type ApiErrorProps = {
  message: string;
  status?: number;
  code?: string;
  requestId?: string;
  url?: string;
  cause?: unknown;
};

export class ApiError extends Error {
  readonly status?: number;
  readonly code?: string;
  readonly requestId?: string;
  readonly url?: string;
  readonly cause?: unknown;

  constructor(props: ApiErrorProps) {
    super(props.message);
    this.name = "ApiError";
    this.status = props.status;
    this.code = props.code;
    this.requestId = props.requestId;
    this.url = props.url;
    this.cause = props.cause;
  }
}
