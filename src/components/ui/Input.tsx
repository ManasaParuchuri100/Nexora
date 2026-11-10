import React, { useId } from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  hint?: string;
  error?: string;
  id?: string;
}

/** A text input with a visible label, optional hint and a validation message. */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, id, className = '', ...rest },
  ref,
) {
  const auto = useId();
  const inputId = id ?? auto;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;
  return (
    <div className="nx-field">
      <label htmlFor={inputId}>{label}</label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={className}
        {...rest}
      />
      {error ? (
        <div id={`${inputId}-error`} role="alert" className="text-[12px] text-danger mt-1.5">{error}</div>
      ) : hint ? (
        <div id={`${inputId}-hint`} className="text-[12px] text-ink-3 mt-1.5">{hint}</div>
      ) : null}
    </div>
  );
});
