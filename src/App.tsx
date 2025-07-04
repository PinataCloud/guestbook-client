import { useState, useEffect, type FormEvent, useCallback } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import {
	Loader2Icon,
	NotebookPenIcon,
	ShareIcon,
	SignatureIcon,
} from "lucide-react";
import {
	type BaseError,
	useAccount,
	useConnect,
	useWaitForTransactionReceipt,
	useWriteContract,
	useSwitchChain,
} from "wagmi";
import { abi, CONTRACT_ADDRESS } from "./lib/contract";
import { arbitrum } from "viem/chains";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { GifSearch } from "./components/GifSearch";
import { LearnMore } from "./components/LearnMore";
import { toast } from "sonner";
import { sdk } from "@farcaster/frame-sdk";
import pinnie from "./assets/pinnie.svg";

interface GuestbookEntry {
	id: string;
	signer: string;
	message: string;
	imageUrl: string;
	timestamp: number;
	farcasterName?: string;
	farcasterDisplayName?: string;
	farcasterAvatar?: string;
	ensName?: string;
	lensHandle?: string;
}

function App() {
	const [entries, setEntries] = useState<GuestbookEntry[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [message, setMessage] = useState<string>("");
	const [imageUrl, setImageUrl] = useState<string>("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Wallet connection states
	const { address, isConnected, chain } = useAccount();
	const { connect, connectors } = useConnect();
	const { switchChain, switchChainAsync } = useSwitchChain();

	// Contract interaction states
	const { data: hash, error, isPending, writeContract } = useWriteContract();
	const { isLoading: isConfirming, isSuccess: isConfirmed } =
		useWaitForTransactionReceipt({
			hash,
		});

	async function connectWallet() {
		connect({ connector: connectors[0], chainId: arbitrum.id });
		if (chain?.id !== arbitrum.id) {
			await switchChainAsync({ chainId: arbitrum.id });
		}
	}

	const fetchEntries = useCallback(async () => {
		setIsLoading(true);

		try {
			const response = await fetch(
				`${import.meta.env.VITE_SERVER_URL}/entries`,
			);
			const data = await response.json();
			setEntries(data);
		} catch (error) {
			console.error("Error fetching entries:", error);
			toast.error("Failed to load guestbook entries");
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		if (isConnected && chain?.id !== arbitrum.id) {
			toast.warning("Wrong network detected", {
				description:
					"Please switch to Arbitrum for this application to work properly",
				action: {
					label: "Switch",
					onClick: () => switchChain({ chainId: arbitrum.id }),
				},
			});
		}
	}, [chain, isConnected, switchChain]);

	useEffect(() => {
		if (hash && isConfirming) {
			toast.loading("Waiting for transaction confirmation...", {
				id: "tx-confirming",
			});
		}
	}, [hash, isConfirming]);

	useEffect(() => {
		if (isConfirmed && hash) {
			toast.dismiss("tx-confirming"); // Dismiss the loading toast
			toast.success("Your message has been added to the guestbook!");

			// After confirmation, fetch the updated entries once
			setTimeout(() => {
				fetchEntries();
				setIsSubmitting(false);
			}, 2000); // Wait 2 seconds for indexer to process
		}
	}, [isConfirmed, hash, fetchEntries]);

	useEffect(() => {
		if (isPending) {
			setIsSubmitting(true);
		}
	}, [isPending]);

	useEffect(() => {
		if (error) {
			toast.error("Transaction Error", {
				description: (error as BaseError).shortMessage || error.message,
			});
		}
	}, [error]);

	useEffect(() => {
		fetchEntries();
	}, [fetchEntries]);

	async function submitEntry(e: FormEvent) {
		e.preventDefault();
		if (!message || !isConnected) return;

		try {
			if (chain?.id !== arbitrum.id) {
				toast.loading("Switching to Arbitrum network...", {
					id: "chain-switch",
				});
				try {
					await switchChainAsync({ chainId: arbitrum.id });
					toast.dismiss("chain-switch");
				} catch (error) {
					console.log(error);
					toast.dismiss("chain-switch");
					toast.error("Failed to switch to Arbitrum network");
					return; // Exit early if chain switch fails
				}
			}
			const submittedMessage = message;
			const submittedImageUrl = imageUrl;

			writeContract({
				address: CONTRACT_ADDRESS,
				abi: abi,
				functionName: "signGuestbook",
				args: [submittedMessage, submittedImageUrl],
			});

			setMessage("");
			setImageUrl("");
		} catch (error) {
			console.error("Error submitting entry:", error);
			toast.error("Failed to submit your guestbook entry");
			setIsSubmitting(false);
		}
	}

	const getDisplayName = (entry: GuestbookEntry) => {
		if (entry.farcasterName) return entry.farcasterName;
		if (entry.farcasterDisplayName) return entry.farcasterDisplayName;
		if (entry.ensName) return entry.ensName;
		return `${entry.signer.substring(0, 6)}...${entry.signer.substring(entry.signer.length - 4)}`;
	};

	return (
		<div className="mx-auto px-4 py-8 max-w-xl">
			<img className="w-24 mx-auto" src={pinnie} alt="Pinnie" />
			<h1 className="sm:text-5xl text-4xl font-[900] mb-6 text-center">
				Pinnie's Guestbook
			</h1>

			<div className="w-full flex items-center justify-center my-6">
				<LearnMore />
			</div>

			{connectors.length > 0 ? (
				<>
					<div className="mb-4 text-center">
						{isConnected ? (
							<div className="flex flex-col items-center gap-2">
								<p className="text-sm font-mono p-2">
									{address?.substring(0, 6)}...
									{address?.substring(address.length - 4)}
								</p>
							</div>
						) : (
							<Button onClick={connectWallet}>Connect Wallet</Button>
						)}
					</div>

					<Card className="mb-8">
						<form onSubmit={submitEntry}>
							<CardHeader className="mb-4">
								<CardTitle>Leave a message</CardTitle>
								<CardDescription>
									Share your thoughts with others
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<Input
										placeholder="Your message..."
										value={message}
										onChange={(e) => setMessage(e.target.value)}
										className="w-full"
										required
										disabled={isSubmitting}
									/>
								</div>
								<div>
									<GifSearch
										onSelect={(url) => setImageUrl(url)}
										selectedGif={imageUrl || null}
									/>
								</div>
							</CardContent>
							<CardFooter className="flex w-full gap-2 items-center my-4">
								<Button
									onClick={() =>
										sdk.actions.composeCast({
											text: "I just signed Pinnie's Guestbook!",
											embeds: ["https://guestbook.pinnie.fun"],
										})
									}
									variant="secondary"
									className="flex-1"
								>
									<ShareIcon />
									Share
								</Button>
								<Button
									type="submit"
									className="flex-1"
									disabled={
										!message ||
										!isConnected ||
										isPending ||
										isConfirming ||
										isSubmitting
									}
								>
									{isPending || isConfirming ? (
										<>
											<Loader2Icon className="animate-spin" />
											Processing...
										</>
									) : (
										<>
											<SignatureIcon />
											Write
										</>
									)}
								</Button>
							</CardFooter>
						</form>
					</Card>
				</>
			) : (
				<div className="text-center text-muted-foreground mb-4 text-sm">
					<p>
						Leave a message by visiting inside Farcaster or connecting with a
						wallet enabled browser!
					</p>
				</div>
			)}

			<div className="space-y-4 relative">
				{isLoading ? (
					<div className="flex items-center justify-center py-8">
						<NotebookPenIcon className="animate-bounce h-8 w-8" />
					</div>
				) : entries.length === 0 ? (
					<p className="text-center py-4">
						No entries yet. Be the first to sign!
					</p>
				) : (
					// Just render the confirmed entries
					entries.map((entry) => (
						<Card key={entry.id} className="mb-4">
							<CardHeader>
								<div className="flex items-center gap-3">
									<Avatar>
										{entry.farcasterAvatar ? (
											<AvatarImage
												src={entry.farcasterAvatar}
												alt={getDisplayName(entry)}
											/>
										) : (
											<AvatarFallback>
												{getDisplayName(entry).substring(0, 2).toUpperCase()}
											</AvatarFallback>
										)}
									</Avatar>
									<div>
										<CardTitle className="text-lg">
											{getDisplayName(entry)}
										</CardTitle>
										<CardDescription>
											{new Date(entry.timestamp * 1000).toLocaleString()}
										</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<p>{entry.message}</p>
								{entry.imageUrl && (
									<div className="mt-4">
										<img
											src={entry.imageUrl}
											alt="Entrygif"
											className="max-h-64 rounded-md mx-auto"
											onError={(e) => (e.currentTarget.style.display = "none")}
										/>
									</div>
								)}
							</CardContent>
						</Card>
					))
				)}
			</div>
		</div>
	);
}

export default App;
