'use client';

import { Controller } from 'react-hook-form';
import type { Control, FieldError, FieldValues, Path } from 'react-hook-form';
import { TextField, InputAdornment } from '@mui/material';
import type { TextFieldProps } from '@mui/material';
import { cloneElement, isValidElement } from 'react';

// ─── Props ────────────────────────────────────────────────────────────────────

interface FormFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  placeholder?: string;
  /** Ícone React — receberá color="primary" e fontSize="small" automaticamente */
  icon: React.ReactNode;
  error?: FieldError;
  /** Props extras repassadas ao TextField (ex: multiline, rows, type, etc.) */
  slotProps?: Partial<TextFieldProps>;
  /** sx extra para o InputAdornment (ex: { alignSelf: 'flex-start', mt: 1.5 }) */
  adornmentSx?: object;
  /** Regras de validação do React Hook Form (ex: { required: 'Obrigatório' }) */
  rules?: object;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function FormField<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  icon,
  error,
  slotProps,
  adornmentSx,
  rules,
}: FormFieldProps<T>) {
  const styledIcon = isValidElement(icon)
    ? cloneElement(icon as React.ReactElement<{ color?: string; fontSize?: string }>, {
        color: 'primary',
        fontSize: 'small',
      })
    : icon;

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <TextField
          {...field}
          label={label}
          placeholder={placeholder}
          fullWidth
          error={!!error}
          helperText={error?.message}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={adornmentSx}>
                {styledIcon}
              </InputAdornment>
            ),
          }}
          {...slotProps}
        />
      )}
    />
  );
}
