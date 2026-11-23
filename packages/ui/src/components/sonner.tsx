import {
	CircleCheckIcon,
	InfoIcon,
	Loader2Icon,
	OctagonXIcon,
	TriangleAlertIcon,
} from "lucide-react";
import type * as React from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
	return (
		<Sonner
			theme="light"
			position="top-center"
			className="toaster group"
			icons={{
				success: (
					<CircleCheckIcon className="size-4 fill-white text-[#1f1a17]" />
				),
				info: <InfoIcon className="size-4" />,
				warning: <TriangleAlertIcon className="size-4" />,
				error: <OctagonXIcon className="size-4" />,
				loading: <Loader2Icon className="size-4 animate-spin" />,
			}}
			style={
				{
					"--normal-bg": "#2a2420",
					"--normal-text": "var(--surface)",
					"--normal-border": "#16120f",
					"--border-radius": "9999px",
				} as React.CSSProperties
			}
			toastOptions={{
				classNames: {
					toast: "cn-toast font-medium text-caption shadow-float",
				},
			}}
			{...props}
		/>
	);
};

export { Toaster };
