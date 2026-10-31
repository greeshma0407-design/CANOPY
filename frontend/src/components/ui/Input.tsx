import React, { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  suffix?: string;
  hint?: string;
  error?: string;
  containerStyle?: React.CSSProperties;
}

export const Input: React.FC<InputProps> = ({
  label,
  suffix,
  hint,
  error,
  id,
  containerStyle,
  className = '',
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className="form-group" style={containerStyle}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <div className="input-wrapper">
        <input
          id={inputId}
          className={`form-input ${className}`}
          style={{
            borderColor: error ? 'var(--color-danger)' : undefined,
            paddingRight: suffix ? '3.5rem' : undefined
          }}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {suffix && <span className="input-suffix">{suffix}</span>}
      </div>
      {error ? (
        <span id={`${inputId}-error`} className="form-error">
          {error}
        </span>
      ) : hint ? (
        <span id={`${inputId}-hint`} className="form-hint">
          {hint}
        </span>
      ) : null}
    </div>
  );
};
