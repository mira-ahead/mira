"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { cn } from "cn";

function Switch({
	className,
	size = "default",
	...props
}: SwitchPrimitive.Root.Props & {
	size?: "sm" | "default";
}) {
	return (
		<SwitchPrimitive.Root
			data-slot="switch"
			data-size={size}
			className={cn(
				"peer group/switch ui-track focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 data-checked:btn-primary relative inline-flex shrink-0 items-center rounded-full px-[3px] transition-[background-image] outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-[3px] aria-invalid:ring-[3px] data-disabled:cursor-not-allowed data-disabled:opacity-50 data-[size=default]:h-8 data-[size=default]:w-[52px] data-[size=sm]:h-6 data-[size=sm]:w-[40px]",
				className,
			)}
			{...props}
		>
			<SwitchPrimitive.Thumb
				data-slot="switch-thumb"
				className="ui-thumb pointer-events-none block rounded-full transition-transform duration-200 ease-(--ease-out) group-data-[size=default]/switch:size-6 group-data-[size=sm]/switch:size-[18px] group-data-[size=default]/switch:data-checked:translate-x-5 group-data-[size=sm]/switch:data-checked:translate-x-4 data-unchecked:translate-x-0 motion-reduce:transition-none"
			/>
		</SwitchPrimitive.Root>
	);
}

export { Switch };
