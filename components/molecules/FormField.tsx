'use client';

import React from 'react';
import { useFormContext, type FieldError } from 'react-hook-form';
import { cn } from '@/lib/utils/cn';
import { Text } from '@/components/atoms/Text';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
  description?: string;
  /** Controlled error — overrides react-hook-form error */
  error?: FieldError | string;
}

// ─── Component ────────────────────────────────────────────────────────────────
// Integrates with React Hook Form via useFormContext.
// Wraps: Label + Input + Description + Error message.

export function FormField({
  name,
  label,
  description,
  error: externalError,
  className,
  ...inputProps
}: FormFieldProps) {
  const { register, formState: { errors } } = useFormContext();

  const fieldError = externalError ?? errors[name];
  const errorMessage =
    typeof fieldError === 'string'
      ? fieldError
      : (fieldError as FieldError | undefined)?.message;

  const inputId = `field-${name}`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
        {label}
        {inputProps.required && (
          <span className="ml-1 text-error" aria-hidden="true">*</span>
        )}
      </label>

      <input
        id={inputId}
        aria-describedby={description ? `${inputId}-desc` : undefined}
        aria-invalid={!!errorMessage}
        aria-errormessage={errorMessage ? `${inputId}-error` : undefined}
        className={cn(
          'w-full rounded-md border bg-background-secondary px-3 py-2.5 text-sm text-text-primary',
          'placeholder:text-text-tertiary',
          'transition-colors duration-fast',
          'border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30',
          errorMessage && 'border-error focus:border-error focus:ring-error/30',
          className
        )}
        {...register(name)}
        {...inputProps}
      />

      {description && (
        <Text id={`${inputId}-desc`} variant="caption" color="tertiary">
          {description}
        </Text>
      )}

      {errorMessage && (
        <Text id={`${inputId}-error`} variant="caption" color="error" role="alert">
          {errorMessage}
        </Text>
      )}
    </div>
  );
}
