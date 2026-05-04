import type { KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";

import { useDebouncedValue } from "./useDebouncedValue";

type Options = {
	param?: string;
	resetParam?: string | null;
	delayMs?: number;
};

type Result = {
	value: string;
	setValue: (next: string) => void;
	urlValue: string;
	clear: () => void;
	handleKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
};

export const useDebouncedSearch = ({
	param = "search",
	resetParam = "page",
	delayMs = 300,
}: Options = {}): Result => {
	const [searchParams, setSearchParams] = useSearchParams();
	const urlValue = searchParams.get(param) ?? "";

	const [value, setValue] = useState(urlValue);
	const debounced = useDebouncedValue(value, delayMs);

	const lastCommittedRef = useRef(urlValue);

	useEffect(() => {
		if (debounced === urlValue) return;

		lastCommittedRef.current = debounced;
		setSearchParams(
			(prev) => {
				const next = new URLSearchParams(prev);
				if (debounced === "") {
					next.delete(param);
				} else {
					next.set(param, debounced);
				}
				if (resetParam) next.delete(resetParam);
				return next;
			},
			{ replace: true },
		);
	}, [debounced, urlValue, param, resetParam, setSearchParams]);

	useEffect(() => {
		if (urlValue === lastCommittedRef.current) return;
		lastCommittedRef.current = urlValue;
		setValue(urlValue);
	}, [urlValue]);

	const clear = () => setValue("");

	const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Escape" && value !== "") {
			event.preventDefault();
			clear();
		}
	};

	return { value, setValue, urlValue, clear, handleKeyDown };
};
