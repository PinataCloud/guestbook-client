import { type ReactNode, useEffect, useState } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { createWagmiConfig } from "../lib/config";
import sdk from "@farcaster/frame-sdk";
import type { Context } from "@farcaster/frame-sdk";

const queryClient = new QueryClient();

export function ConfigProvider({ children }: { children: ReactNode }) {
	const [context, setContext] = useState<Context.FrameContext | undefined>();
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const initializeSdk = async () => {
			try {
				const frameContext = await sdk.context;
				setContext(frameContext);
				sdk.actions.ready();
			} catch (e) {
				console.log("Not in a Miniapp context: ", e);
			} finally {
				setIsLoading(false);
			}
		};

		initializeSdk();
	}, []);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				Loading...
			</div>
		);
	}

	const config = createWagmiConfig(context as Context.FrameContext);

	return (
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</WagmiProvider>
	);
}
