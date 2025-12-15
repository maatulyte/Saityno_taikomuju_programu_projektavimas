interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function Field({ label, className, ...props }: Props) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <input
        {...props}
        className={`
          h-10 w-full rounded-md px-3 text-sm
          bg-secondary text-secondary-foreground
          border border-border
          placeholder:text-muted-foreground
          focus:outline-none focus:ring-1 focus:ring-ring
          disabled:opacity-50
          aria-[invalid=true]:border-destructive
          aria-[invalid=true]:ring-destructive
          ${className ?? ""}
        `}
      />
    </label>
  );
}
