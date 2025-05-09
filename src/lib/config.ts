import { http, createConfig } from "wagmi";
import { arbitrum } from "wagmi/chains";
import { farcasterFrame as miniAppConnector } from "@farcaster/frame-wagmi-connector";
import type { Context } from "@farcaster/frame-sdk";

export function createWagmiConfig(context: Context.FrameContext) {
	if (context) {
		const config = createConfig({
			chains: [arbitrum],
			transports: {
				[arbitrum.id]: http(),
			},
			connectors: [miniAppConnector()],
		});
		return config;
	}
	const config = createConfig({
		chains: [arbitrum],
		transports: {
			[arbitrum.id]: http(),
		},
	});
	return config;
}
