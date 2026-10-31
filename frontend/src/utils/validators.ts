export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validatePositiveNumber(
  value: unknown,
  fieldName: string,
  allowZero: boolean = false
): ValidationResult {
  if (value === null || value === undefined || value === '') {
    return { valid: false, error: `${fieldName} is required.` };
  }
  const num = Number(value);
  if (isNaN(num)) {
    return { valid: false, error: `${fieldName} must be a valid number.` };
  }
  if (allowZero ? num < 0 : num <= 0) {
    return { valid: false, error: `${fieldName} must be greater than ${allowZero ? 'or equal to 0' : '0'}.` };
  }
  return { valid: true };
}

export function validateRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): ValidationResult {
  if (isNaN(value)) {
    return { valid: false, error: `${fieldName} must be a valid number.` };
  }
  if (value < min || value > max) {
    return { valid: false, error: `${fieldName} must be between ${min} and ${max}.` };
  }
  return { valid: true };
}

export function validateRequired(
  value: unknown,
  fieldName: string
): ValidationResult {
  if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
    return { valid: false, error: `${fieldName} cannot be blank.` };
  }
  return { valid: true };
}
