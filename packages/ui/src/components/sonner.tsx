import {
	CheckCircleIcon,
	InfoIcon,
	SpinnerGapIcon,
	WarningIcon,
	XCircleIcon,
} from "@phosphor-icons/react";
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
					<CheckCircleIcon weight="fill" className="size-4 text-white" />
				),
				info: <InfoIcon className="size-4" />,
				warning: <WarningIcon className="size-4" />,
				error: <XCircleIcon className="size-4" />,
				loading: <SpinnerGapIcon className="size-4 animate-spin" />,
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
