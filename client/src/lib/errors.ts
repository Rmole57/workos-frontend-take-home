import { ApiError } from "../api/client";

type ErrorDescription = {
	message: string;
	retryable: boolean;
};

export const describeError = (error: unknown): ErrorDescription => {
	if (error instanceof ApiError) {
		if (error.status === 401) {
			return {
				message: "You need to sign in to view this data.",
				retryable: false,
			};
		}
		if (error.status === 403) {
			return {
				message: "You don't have permission to view this data.",
				retryable: false,
			};
		}
		if (error.status === 404) {
			return { message: "We couldn't find this data.", retryable: false };
		}
		if (error.status >= 400 && error.status < 500) {
			return {
				message: error.message || "The request couldn't be completed.",
				retryable: false,
			};
		}
		return {
			message: "Our server hit a snag. Please try again.",
			retryable: true,
		};
	}

	return {
		message: "Something went wrong. Please try again.",
		retryable: true,
	};
};
