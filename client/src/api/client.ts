const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3002";

export class ApiError extends Error {
	readonly status: number;

	constructor(status: number, message: string, options?: ErrorOptions) {
		super(message, options);
		this.name = "ApiError";
		this.status = status;
	}
}

type RequestOptions = {
	method?: "GET" | "POST" | "PATCH" | "DELETE";
	body?: unknown;
	search?: Record<string, string | number | undefined | null>;
	signal?: AbortSignal;
};

export async function apiFetch<T>(
	path: string,
	options: RequestOptions = {},
): Promise<T> {
	const url = new URL(path, API_URL);
	if (options.search) {
		for (const [key, value] of Object.entries(options.search)) {
			if (value === undefined || value === null || value === "") continue;
			url.searchParams.set(key, String(value));
		}
	}

	const response = await fetch(url.toString(), {
		method: options.method ?? "GET",
		headers:
			options.body !== undefined
				? { "Content-Type": "application/json" }
				: undefined,
		body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
		signal: options.signal,
	});

	if (!response.ok) {
		const message = await response
			.json()
			.then((payload: { message?: string }) => payload?.message)
			.catch(() => undefined);
		throw new ApiError(
			response.status,
			message ?? response.statusText ?? `HTTP ${response.status}`,
			{ cause: response.body },
		);
	}

	return (await response.json()) as T;
}
