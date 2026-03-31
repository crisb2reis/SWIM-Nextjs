import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { FormField } from '../FormField';

function TestWrapper() {
  const { control } = useForm({ defaultValues: { name: '' } });
  return (
    <FormField
      name={'name'}
      control={control}
      label={'Nome'}
      icon={<span>ICON</span>}
      placeholder={'Digite...'}
    />
  );
}

test('renderiza FormField e permite input', async () => {
  render(<TestWrapper />);
  const input = screen.getByPlaceholderText('Digite...') as HTMLInputElement;
  await userEvent.type(input, 'abc');
  expect(input.value).toBe('abc');
});
