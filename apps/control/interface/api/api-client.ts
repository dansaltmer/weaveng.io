/**
 * Shared fetch helper for Control's API. Every `useQuery`/`useMutation`
 * should go through this rather than re-parsing responses at each call
 * site.
 *
 * Success responses use the `{ data, meta }` envelope. Error responses use
 * RFC 9457 Problem Details (`application/problem+json`).
 */

export type ApiEnvelope<TData> = {
  readonly data: TData;
  readonly meta?: Readonly<Record<string, unknown>>;
};

export type ApiProblem = {
  readonly type: string;
  readonly title: string;
  readonly status: number;
  readonly detail?: string;
  readonly instance?: string;
} & Readonly<Record<string, unknown>>;

export class ApiError extends Error {
  readonly problem: ApiProblem;

  constructor(problem: ApiProblem) {
    super(problem.title);
    this.name = 'ApiError';
    this.problem = problem;
  }
}

export type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  readonly body?: unknown;
};

/**
 * Performs a request against Control's API and unwraps the `{ data, meta }`
 * envelope. Throws `ApiError` for `application/problem+json` responses.
 */
export async function apiFetch<TData>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiEnvelope<TData>> {
  const { body, headers, ...rest } = options;

  const response = await fetch(path, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const contentType = response.headers.get('content-type') ?? '';

  if (!response.ok) {
    if (contentType.includes('application/problem+json')) {
      const problem = (await response.json()) as ApiProblem;
      throw new ApiError(problem);
    }

    throw new ApiError({
      type: 'about:blank',
      title: response.statusText || 'Request failed',
      status: response.status,
    });
  }

  return (await response.json()) as ApiEnvelope<TData>;
}
