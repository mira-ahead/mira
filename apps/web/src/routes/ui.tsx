import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@mira/ui/components/alert-dialog";
import {
	Attachment,
	AttachmentAction,
	AttachmentActions,
	AttachmentContent,
	AttachmentDescription,
	AttachmentMedia,
	AttachmentTitle,
} from "@mira/ui/components/attachment";
import { Badge } from "@mira/ui/components/badge";
import { Bubble, BubbleContent } from "@mira/ui/components/bubble";
import { Button } from "@mira/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@mira/ui/components/card";
import { Checkbox } from "@mira/ui/components/checkbox";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@mira/ui/components/collapsible";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@mira/ui/components/dropdown-menu";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@mira/ui/components/empty";
import { Input } from "@mira/ui/components/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@mira/ui/components/input-group";
import { Label } from "@mira/ui/components/label";
import { Marker } from "@mira/ui/components/marker";
import {
	Message,
	MessageContent,
	MessageHeader,
} from "@mira/ui/components/message";
import {
	MessageScroller,
	MessageScrollerButton,
	MessageScrollerContent,
	MessageScrollerItem,
	MessageScrollerProvider,
	MessageScrollerViewport,
} from "@mira/ui/components/message-scroller";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@mira/ui/components/popover";
import { Separator } from "@mira/ui/components/separator";
import { Skeleton } from "@mira/ui/components/skeleton";
import { Switch } from "@mira/ui/components/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@mira/ui/components/table";
import { Textarea } from "@mira/ui/components/textarea";
import { ToggleGroup, ToggleGroupItem } from "@mira/ui/components/toggle-group";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@mira/ui/components/tooltip";
import { createFileRoute } from "@tanstack/react-router";
import {
	ArrowUpIcon,
	ChevronDownIcon,
	CircleCheckIcon,
	CircleHelpIcon,
	CircleIcon,
	CircleXIcon,
	ImageIcon,
	MapPinIcon,
	RouteIcon,
	XIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/ui")({
	component: UiGallery,
});

function Specimen({ name, children }: { name: string; children: ReactNode }) {
	return (
		<section className="bg-surface grid content-start gap-3 rounded-2xl border p-4">
			<h3 className="text-caption text-muted-foreground font-mono">{name}</h3>
			<div className="flex flex-wrap items-center gap-3">{children}</div>
		</section>
	);
}

function Group({ title, children }: { title: string; children: ReactNode }) {
	return (
		<div className="grid gap-3">
			<h2 className="text-heading font-semibold">{title}</h2>
			<div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
				{children}
			</div>
		</div>
	);
}

function UiGallery() {
	return (
		<div className="mx-auto grid w-full max-w-5xl gap-10 overflow-y-auto px-4 py-8">
			<h1 className="text-display font-semibold">Mira UI</h1>

			<Group title="Actions">
				<Specimen name="button">
					<Button>Plan a journey</Button>
					<Button variant="secondary">Keep my plan</Button>
					<Button variant="outline" size="sm">
						Details
					</Button>
					<Button variant="soft" size="sm">
						<RouteIcon data-icon="inline-start" />
						Switch route
					</Button>
					<Button variant="ghost" size="sm">
						Cancel
					</Button>
					<Button variant="destructive" size="sm">
						Delete journey
					</Button>
					<Button variant="outline" size="icon" aria-label="Locate me">
						<MapPinIcon />
					</Button>
					<Button size="sm" disabled>
						Saving…
					</Button>
				</Specimen>
				<Specimen name="badge">
					<Badge variant="demo" />
					<Badge variant="success" icon={<CircleCheckIcon />}>
						Working
					</Badge>
					<Badge variant="danger" icon={<CircleXIcon />}>
						Out of service
					</Badge>
					<Badge variant="warning" icon={<CircleIcon />}>
						62% likely
					</Badge>
					<Badge variant="unknown" icon={<CircleHelpIcon />}>
						No recent report
					</Badge>
					<Badge variant="outline">Line 14</Badge>
				</Specimen>
				<Specimen name="toggle-group">
					<ToggleGroup defaultValue={["leave"]} aria-label="Time type">
						<ToggleGroupItem value="leave">Leave at</ToggleGroupItem>
						<ToggleGroupItem value="arrive">Arrive by</ToggleGroupItem>
					</ToggleGroup>
					<ToggleGroup defaultValue={["930"]} aria-label="Forecast for">
						<ToggleGroupItem value="now">Now</ToggleGroupItem>
						<ToggleGroupItem value="930">9:30</ToggleGroupItem>
						<ToggleGroupItem value="return">Return</ToggleGroupItem>
					</ToggleGroup>
				</Specimen>
				<Specimen name="switch">
					<Label className="flex w-full items-center justify-between gap-3">
						Step-free only
						<Switch defaultChecked />
					</Label>
					<Label className="flex w-full items-center justify-between gap-3">
						Avoid long transfers
						<Switch />
					</Label>
				</Specimen>
				<Specimen name="checkbox">
					<Label className="flex items-center gap-3">
						<Checkbox defaultChecked />
						Notify the evening before
					</Label>
					<Label className="flex items-center gap-3">
						<Checkbox />
						Notify at 7:30
					</Label>
				</Specimen>
			</Group>

			<Group title="Forms">
				<Specimen name="input + label">
					<div className="grid w-full gap-1.5">
						<Label htmlFor="ui-from">From</Label>
						<Input id="ui-from" defaultValue="Châtelet" />
					</div>
					<div className="grid w-full gap-1.5">
						<Label htmlFor="ui-to">To</Label>
						<Input id="ui-to" placeholder="Search a station or a place" />
					</div>
				</Specimen>
				<Specimen name="input-group">
					<InputGroup>
						<InputGroupAddon>
							<MapPinIcon />
						</InputGroupAddon>
						<InputGroupInput aria-label="Where to?" placeholder="Where to?" />
					</InputGroup>
					<InputGroup>
						<InputGroupInput
							aria-label="Ask Mira"
							placeholder="Ask Mira about your journey"
						/>
						<InputGroupAddon align="inline-end">
							<InputGroupButton
								variant="default"
								size="icon-sm"
								aria-label="Send"
							>
								<ArrowUpIcon />
							</InputGroupButton>
						</InputGroupAddon>
					</InputGroup>
				</Specimen>
				<Specimen name="textarea">
					<div className="grid w-full gap-1.5">
						<Label htmlFor="ui-report">Report a problem</Label>
						<Textarea
							id="ui-report"
							defaultValue="The elevator on platform 1 was out of service at 8:40."
						/>
					</div>
				</Specimen>
			</Group>

			<Group title="Content">
				<Specimen name="card">
					<Card className="w-full">
						<CardHeader>
							<CardDescription>Tomorrow</CardDescription>
							<CardTitle className="text-time tabular">9:30 → 9:52</CardTitle>
						</CardHeader>
						<CardContent className="grid gap-2">
							<span>Châtelet → Gare de Lyon</span>
							<Badge variant="success" icon={<CircleCheckIcon />}>
								Elevators working
							</Badge>
						</CardContent>
					</Card>
				</Specimen>
				<Specimen name="separator">
					<div className="text-body grid w-full gap-3">
						<span>Leave by 9:12</span>
						<Separator />
						<span>2 elevators on this route</span>
						<Separator />
						<div className="text-caption text-muted-foreground flex items-center gap-3">
							<span>22 min</span>
							<Separator orientation="vertical" className="h-4" />
							<span>1 transfer</span>
						</div>
					</div>
				</Specimen>
				<Specimen name="table">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead />
								<TableHead>Current</TableHead>
								<TableHead>Recommended</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<TableRow>
								<TableCell className="text-muted-foreground">Arrive</TableCell>
								<TableCell>9:52</TableCell>
								<TableCell className="text-accent-foreground font-semibold">
									9:58
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell className="text-muted-foreground">
									All working
								</TableCell>
								<TableCell>48%</TableCell>
								<TableCell className="text-accent-foreground font-semibold">
									91%
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
					<Badge variant="demo" />
				</Specimen>
				<Specimen name="collapsible">
					<Collapsible className="w-full border-y">
						<CollapsibleTrigger className="flex min-h-14 w-full items-center justify-between gap-3 text-left font-semibold [&[data-panel-open]>svg]:rotate-180">
							Why this route?
							<ChevronDownIcon className="text-muted-foreground size-5 transition-transform duration-200" />
						</CollapsibleTrigger>
						<CollapsibleContent className="text-muted-foreground pb-4">
							The recommended route avoids the Gare de Lyon RER elevator, which
							failed 4 times this month. It adds 6 minutes.
						</CollapsibleContent>
					</Collapsible>
				</Specimen>
				<Specimen name="empty">
					<Empty>
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<RouteIcon />
							</EmptyMedia>
							<EmptyTitle>No step-free route yet</EmptyTitle>
							<EmptyDescription>
								Mira only knows Châtelet ↔ Gare de Lyon in this demo.
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				</Specimen>
				<Specimen name="skeleton">
					<div className="grid w-full gap-2">
						<Skeleton className="h-4 w-2/5" />
						<Skeleton className="h-6 w-3/4" />
						<Skeleton className="h-2.5 w-full rounded-full" />
					</div>
				</Specimen>
			</Group>

			<Group title="Overlays">
				<Specimen name="alert-dialog">
					<AlertDialog>
						<AlertDialogTrigger render={<Button variant="soft" size="sm" />}>
							Switch route
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>
									Switch to the recommended route?
								</AlertDialogTitle>
								<AlertDialogDescription>
									You'll arrive at 9:58 instead of 9:52, with one elevator
									instead of two.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Keep my plan</AlertDialogCancel>
								<AlertDialogAction>Switch</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</Specimen>
				<Specimen name="popover">
					<Popover>
						<PopoverTrigger
							render={
								<Button
									variant="outline"
									size="icon-sm"
									aria-label="Photo credit"
								/>
							}
						>
							<ImageIcon />
						</PopoverTrigger>
						<PopoverContent>
							Photo: Wheelmap contributor, CC BY-SA 4.0
						</PopoverContent>
					</Popover>
				</Specimen>
				<Specimen name="dropdown-menu">
					<DropdownMenu>
						<DropdownMenuTrigger
							render={<Button variant="outline" size="sm" />}
						>
							Journey actions
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem>Edit journey</DropdownMenuItem>
							<DropdownMenuItem>Share</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem variant="destructive">
								Delete journey
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</Specimen>
				<Specimen name="tooltip">
					<Tooltip>
						<TooltipTrigger
							render={
								<Button variant="outline" size="icon" aria-label="Locate me" />
							}
						>
							<MapPinIcon />
						</TooltipTrigger>
						<TooltipContent>Locate me</TooltipContent>
					</Tooltip>
				</Specimen>
				<Specimen name="sonner">
					<Button
						variant="outline"
						size="sm"
						onClick={() => toast.success("Journey saved. Mira will watch it.")}
					>
						Show toast
					</Button>
				</Specimen>
			</Group>

			<Group title="Assistant">
				<Specimen name="message + bubble">
					<div className="grid w-full gap-3">
						<Message align="end">
							<MessageContent>
								<Bubble align="end">
									<BubbleContent>Can I still go at 9:30?</BubbleContent>
								</Bubble>
							</MessageContent>
						</Message>
						<Message align="start">
							<MessageContent>
								<MessageHeader>Mira</MessageHeader>
								<Bubble variant="secondary">
									<BubbleContent>
										Yes, but the Gare de Lyon elevator is 62% likely to work.
									</BubbleContent>
								</Bubble>
							</MessageContent>
						</Message>
					</div>
				</Specimen>
				<Specimen name="marker">
					<Marker variant="separator">Tomorrow, 7:30 report</Marker>
				</Specimen>
				<Specimen name="attachment">
					<Attachment className="w-full">
						<AttachmentMedia>
							<ImageIcon />
						</AttachmentMedia>
						<AttachmentContent>
							<AttachmentTitle>elevator-platform-1.jpg</AttachmentTitle>
							<AttachmentDescription>Photo · 1.2 MB</AttachmentDescription>
						</AttachmentContent>
						<AttachmentActions>
							<AttachmentAction size="icon-sm" aria-label="Remove attachment">
								<XIcon />
							</AttachmentAction>
						</AttachmentActions>
					</Attachment>
				</Specimen>
				<Specimen name="message-scroller">
					<div className="h-40 w-full overflow-hidden rounded-xl border">
						<MessageScrollerProvider>
							<MessageScroller>
								<MessageScrollerViewport>
									<MessageScrollerContent className="grid gap-2 p-3">
										{["And the way back?", "OK, watch it for me."].map(
											(text) => (
												<MessageScrollerItem key={text}>
													<Message align="end">
														<MessageContent>
															<Bubble align="end">
																<BubbleContent>{text}</BubbleContent>
															</Bubble>
														</MessageContent>
													</Message>
												</MessageScrollerItem>
											),
										)}
										<MessageScrollerItem scrollAnchor />
									</MessageScrollerContent>
								</MessageScrollerViewport>
								<MessageScrollerButton />
							</MessageScroller>
						</MessageScrollerProvider>
					</div>
				</Specimen>
			</Group>
		</div>
	);
}
