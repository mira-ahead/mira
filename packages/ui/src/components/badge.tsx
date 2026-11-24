import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import type * as React from "react";

const badgeVariants = cva(
	"group/badge focus-visible:ring-ring/50 inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-[6px] border border-transparent px-2.5 text-xs font-semibold whitespace-nowrap transition-colors focus-visible:ring-[3px] [&>svg]:pointer-events-none [&>svg]:size-3.5!",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
				secondary: "bg-secondary text-secondary-foreground",
				outline: "border-border bg-surface text-foreground",
				demo: "border-unknown/40 bg-unknown-surface text-unknown border-dashed font-medium",
				success: "bg-success-surface text-success",
				warning: "bg-warning-surface text-warning",
				danger: "bg-danger-surface text-danger",
				unknown: "bg-unknown-surface text-unknown",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

type StatusVariant = "success" | "warning" | "danger" | "unknown";

type BadgeProps = useRender.ComponentProps<"span"> &
	(
		| { variant: StatusVariant; icon: React.ReactNode }
		| {
				variant?: Exclude<
					VariantProps<typeof badgeVariants>["variant"],
					StatusVariant
				>;
				icon?: React.ReactNode;
		  }
	);

function Badge({
	className,
	variant = "default",
	icon,
	children,
	render,
	...props
}: BadgeProps) {
	return useRender({
		defaultTagName: "span",
		props: mergeProps<"span">(
			{
				className: cn(badgeVariants({ variant }), className),
				children: (
					<>
						{icon}
						{children ?? (variant === "demo" ? "Demo data" : null)}
					</>
				),
			},
			props,
		),
		render,
		state: {
			slot: "badge",
			variant,
		},
	});
}

export { Badge, badgeVariants };
