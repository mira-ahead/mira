import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const buttonVariants = cva(
	"group/button focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 inline-flex shrink-0 items-center justify-center rounded-full bg-clip-padding font-semibold whitespace-nowrap outline-none select-none focus-visible:ring-[3px] active:not-aria-[haspopup]:[transform:scale(0.97)] disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-[3px] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				default: "btn-primary",
				secondary: "btn-secondary",
				outline: "btn-outline",
				ghost: "btn-ghost",
				soft: "btn-soft",
				destructive:
					"bg-danger-surface text-danger hover:bg-danger-surface/80 border border-transparent transition-[transform,background-color] duration-150",
				link: "text-accent-foreground border border-transparent underline-offset-4 hover:underline",
			},
			size: {
				default:
					"text-body h-12 gap-2 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
				xs: "h-8 gap-1 px-3 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
				sm: "text-caption h-10 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
				lg: "h-14 gap-2 px-6 text-base has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
				icon: "size-12 p-0 [&_svg:not([class*='size-'])]:size-5",
				"icon-xs": "size-7 p-0 [&_svg:not([class*='size-'])]:size-3",
				"icon-sm": "size-9 p-0",
				"icon-lg": "size-14 p-0 [&_svg:not([class*='size-'])]:size-6",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Button({
	className,
	variant = "default",
	size = "default",
	...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
	return (
		<ButtonPrimitive
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
