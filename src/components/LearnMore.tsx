import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Link } from "@mini_apps/utilities";
import { BookIcon, InfoIcon } from "lucide-react";

export function LearnMore() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button size="sm" variant="outline">
					<InfoIcon />
					What is This?
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Pinnie's Guestbook</DialogTitle>
				</DialogHeader>
				Pinnie's Guestbook is an example of how developers can index onchain
				smart contract events with Ponder and back them up with Pinata. As L2
				blockchains evolve and need to scale there becomes a rising need for
				offchain data storage, and IPFS still serves as the best option for both
				accessibility and decentralization. Read more with the link below!
				<Button asChild>
					<Link href="https://pinata.cloud/blog/backing-up-arbitrum-event-data-to-ipfs-using-ponder-and-pinata/">
						<BookIcon />
						Read Blog Post
					</Link>
				</Button>
			</DialogContent>
		</Dialog>
	);
}
