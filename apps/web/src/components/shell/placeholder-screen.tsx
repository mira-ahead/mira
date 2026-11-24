import { ScreenHeader } from "./screen-header";

export function PlaceholderScreen({
	title,
	heading,
	description,
}: {
	title: string;
	heading: string;
	description: string;
}) {
	return (
		<div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
			<ScreenHeader title={title} />
			<section className="grid gap-1 px-5 pt-6 pb-8">
				<h2 className="text-heading font-semibold">{heading}</h2>
				<p className="text-body text-muted-foreground max-w-prose">
					{description}
				</p>
			</section>
		</div>
	);
}
