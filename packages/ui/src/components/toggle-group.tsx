import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import { cn } from "cn";
import * as React from "react";

function useSlidingThumb() {
	const rootRef = React.useRef<HTMLDivElement>(null);
	const thumbRef = React.useRef<HTMLSpanElement>(null);

	React.useLayoutEffect(() => {
		const root = rootRef.current;
		const thumb = thumbRef.current;
		if (!root || !thumb) return;

		let placed = false;
		const place = () => {
			const pressed = root.querySelector<HTMLElement>(
				'[data-slot="toggle-group-item"][aria-pressed="true"]',
			);
			thumb.style.opacity = pressed ? "1" : "0";
			if (!pressed) return;
			if (!placed) thumb.style.transition = "none";
			thumb.style.width = `${pressed.offsetWidth}px`;
			thumb.style.transform = `translateX(${pressed.offsetLeft}px)`;
			if (!placed) {
				thumb.getBoundingClientRect();
				thumb.style.transition = "";
				placed = true;
			}
		};

		place();
		const mutations = new MutationObserver(place);
		mutations.observe(root, {
			subtree: true,
			attributeFilter: ["aria-pressed"],
		});
		const resizes = new ResizeObserver(place);
		resizes.observe(root);
		document.fonts?.ready.then(place);
		return () => {
			mutations.disconnect();
			resizes.disconnect();
		};
	}, []);

	return { rootRef, thumbRef };
}

function ToggleGroup({
	className,
	children,
	...props
}: ToggleGroupPrimitive.Props) {
	const { rootRef, thumbRef } = useSlidingThumb();

	return (
		<ToggleGroupPrimitive
			ref={rootRef}
			data-slot="toggle-group"
			className={cn(
				"group/toggle-group ui-track relative inline-grid w-fit auto-cols-fr grid-flow-col rounded-full p-[3px]",
				className,
			)}
			{...props}
		>
			<span
				ref={thumbRef}
				aria-hidden="true"
				className="ui-thumb pointer-events-none absolute top-[3px] bottom-[3px] left-0 rounded-full transition-transform duration-[320ms] ease-(--ease-out) motion-reduce:transition-none"
			/>
			{children}
		</ToggleGroupPrimitive>
	);
}

function ToggleGroupItem({
	className,
	children,
	...props
}: TogglePrimitive.Props) {
	return (
		<TogglePrimitive
			data-slot="toggle-group-item"
			className={cn(
				"text-caption text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 aria-pressed:text-foreground relative inline-flex h-10 items-center justify-center gap-1.5 rounded-full px-4 font-semibold whitespace-nowrap transition-colors duration-150 outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				className,
			)}
			{...props}
		>
			{children}
		</TogglePrimitive>
	);
}

export { ToggleGroup, ToggleGroupItem };
