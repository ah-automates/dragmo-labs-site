import * as React from "react";

import { cn } from "@/lib/utils";

const fieldBase =
  "w-full rounded-input border border-border bg-white/[0.03] px-4 text-base text-foreground placeholder:text-foreground-muted/50 transition-[border-color,background-color,box-shadow] duration-200 focus-visible:border-accent focus-visible:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-red-500/70 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-red-500/25";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(fieldBase, "h-13 py-3.5", className)} {...props} />
  ),
);
Input.displayName = "Input";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(fieldBase, "resize-none py-3.5", className)} {...props} />
));
Textarea.displayName = "Textarea";

const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      fieldBase,
      // Opaque background so the native control and its popup stay dark on
      // Windows and Linux, where translucency falls back to the UA light theme.
      "h-13 cursor-pointer appearance-none bg-[#0d1622] py-3.5 [&>option]:bg-[#0d1622] [&>option]:text-foreground",
      className,
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  /** Required so a control can never ship without an associated label. */
  htmlFor: string;
};

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "font-body text-xs font-medium uppercase tracking-[0.12em] text-foreground-muted",
        className,
      )}
      {...props}
    />
  ),
);
Label.displayName = "Label";

export { Input, Textarea, Select, Label };
