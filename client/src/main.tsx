import { Theme } from "@radix-ui/themes";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { Toaster } from "sonner";
import { App } from "./App";
import { queryClient } from "./lib/queryClient";

import "@radix-ui/themes/styles.css";
import "./app.css";

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element in index.html");

createRoot(root).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>
				<Theme accentColor="indigo" radius="medium" appearance="inherit">
					<App />
					<Toaster richColors position="bottom-right" closeButton />
					<ReactQueryDevtools
						initialIsOpen={false}
						buttonPosition="bottom-left"
					/>
				</Theme>
			</BrowserRouter>
		</QueryClientProvider>
	</StrictMode>,
);
