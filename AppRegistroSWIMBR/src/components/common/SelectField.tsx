'use client';

import { Controller } from 'react-hook-form';
import type { Control, FieldError, FieldValues, Path } from 'react-hook-form';
import { TextField, MenuItem } from '@mui/material';
import type { TextFieldProps } from '@mui/material';

interface SelectFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  error?: FieldError;
  options: { value: string; label: string }[];
  slotProps?: Partial<TextFieldProps>;
}

export function SelectField<T extends FieldValues>({
  name,
  control,
  label,
  error,
  options,
  slotProps,
}: SelectFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          select
          label={label}
          fullWidth
          error={!!error}
          helperText={error?.message}
          {...slotProps}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
}
