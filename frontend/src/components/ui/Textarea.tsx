import React, { useId } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  containerStyle?: React.CSSProperties;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  hint,
  error,
  id,
  rows = 3,
  containerStyle,
  className = '',
  ...props
}) => {
  const generatedId = useId();
  const textareaId = id || generatedId;

  return (
    <div className="form-group" style={containerStyle}>
      {label && (
        <label htmlFor={textareaId} className="form-label">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        className={`form-textarea ${className}`}
        style={{
          borderColor: error ? 'var(--color-danger)' : undefined,
          resize: 'vertical'
        }}
        aria-invalid={!!error}
        aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
        {...props}
      />
      {error ? (
        <span id={`${textareaId}-error`} className="form-error">
          {error}
        </span>
      ) : hint ? (
        <span id={`${textareaId}-hint`} className="form-hint">
          {hint}
        </span>
      ) : null}
    </div>
  );
};
