'use client';

import { memo } from 'react';
import { Typography } from '@mui/material';

interface EmailCellProps {
  email?: string | null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Célula segura para exibição de e-mail com mailto: validado.
 * Previne injeção via valores arbitrários da API.
 */
const EmailCell = memo(function EmailCell({ email }: EmailCellProps) {
  const isValid = email && EMAIL_RE.test(email);

  if (!isValid) {
    return (
      <Typography variant="body2" color="text.disabled">
        —
      </Typography>
    );
  }

  return (
    <Typography
      component="a"
      href={`mailto:${encodeURIComponent(email)}`}
      variant="body2"
      color="primary"
      sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
    >
      {email}
    </Typography>
  );
});

export { EmailCell };
