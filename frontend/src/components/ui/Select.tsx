import React, { useId } from 'react';

interface Option {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  hint?: string;
  error?: string;
  containerStyle?: React.CSSProperties;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  hint,
  error,
  id,
  containerStyle,
  className = '',
  ...props
}) => {
  const generatedId = useId();
  const selectId = id || generatedId;

  return (
    <div className="form-group" style={containerStyle}>
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`form-select ${className}`}
        style={{
          borderColor: error ? 'var(--color-danger)' : undefined
        }}
        aria-invalid={!!error}
        aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? (
        <span id={`${selectId}-error`} className="form-error">
          {error}
        </span>
      ) : hint ? (
        <span id={`${selectId}-hint`} className="form-hint">
          {hint}
        </span>
      ) : null}
    </div>
  );
};
