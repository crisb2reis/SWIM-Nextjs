'use client';

import { Controller } from 'react-hook-form';
import type { Control, FieldError, FieldValues, Path } from 'react-hook-form';
import { 
  FormControl, 
  FormLabel, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  FormHelperText,
  Box,
  Typography
} from '@mui/material';

interface RadioFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  error?: FieldError;
}

export function RadioFieldSimNao<T extends FieldValues>({
  name,
  control,
  label,
  error,
}: RadioFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControl 
          error={!!error} 
          component="fieldset" 
          sx={{ 
            bgcolor: '#e8e8e8', 
            p: 1.5, 
            borderRadius: 1,
            width: '100%'
          }}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {label}
          </Typography>
          <RadioGroup 
            {...field} 
            row 
            value={field.value ? 'sim' : 'nao'}
            onChange={(e) => field.onChange(e.target.value === 'sim')}
          >
            <FormControlLabel 
              value="sim" 
              control={<Radio size="small" />} 
              label="Sim" 
            />
            <FormControlLabel 
              value="nao" 
              control={<Radio size="small" />} 
              label="Não" 
            />
          </RadioGroup>
          {error && <FormHelperText>{error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  );
}
