import { tv, type VariantProps } from "tailwind-variants";
import Root from "./toggle.svelte";

export const toggleVariants = tv({
	base: "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:outline hover:outline-3 hover:outline-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground data-[state=on]:outline data-[state=on]:outline-3 data-[state=on]:outline-slate-600",
	variants: {
		variant: {
			default: "bg-transparent",
			outline:
				"border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
		},
		size: {
			default: "h-10 px-3",
			sm: "h-9 px-2.5",
			lg: "h-11 px-5",
		},
	},
	defaultVariants: {
		variant: "default",
		size: "default",
	},
});

export type Variant = VariantProps<typeof toggleVariants>["variant"];
export type Size = VariantProps<typeof toggleVariants>["size"];

export {
	Root,
	//
	Root as Toggle
};

