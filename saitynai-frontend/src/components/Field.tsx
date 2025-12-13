interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function Field({ label, ...props }: Props) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span>{label}</span>
      <input {...props} />
    </label>
  );
}
