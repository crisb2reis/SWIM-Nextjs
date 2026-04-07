'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import Link from 'next/link';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
  Container,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import api from '@/lib/axios';
import { isAxiosError } from 'axios';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    searchParams.get('error') === 'unauthorized'
      ? 'Sessão expirada. Por favor, faça login novamente.'
      : null
  );

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);

      const response = await api.post('/api/v1/auth/login', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const token = response.data.access_token; 

      if (token) {
        localStorage.setItem('token', token); 
        if (searchParams.has('error')) {
          router.replace('/utility/document/documentTable');
        } else {
          router.push('/utility/document/documentTable');
        }
      } else {
        setError('Falha ao obter token de acesso.');
      }
    } catch (err) {
      console.error(err);
      if (isAxiosError(err)) {
        const detail = err.response?.data?.detail;
        if (Array.isArray(detail)) {
          setError(detail[0]?.msg || 'Erro de validação.');
        } else if (typeof detail === 'string') {
          setError(detail);
        } else {
          setError('Credenciais inválidas ou erro no servidor.');
        }
      } else {
        setError('Ocorreu um erro inesperado.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Card sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
            Registro SWIM BR
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Faça login para gerenciar seus documentos
          </Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        <form onSubmit={handleLogin}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              fullWidth
              label="Usuário ou Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={loading}
                      aria-label="alternar visibilidade da senha"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ mt: 1 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
            </Button>
          </Box>
        </form>

        <Box sx={{ textAlign: 'center', mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Nova plataforma?{' '}
            <Link href="/register" passHref legacyBehavior>
              <Typography component="a" variant="body2" sx={{ color: 'primary.main', cursor: 'pointer', fontWeight: 600, textDecoration: 'none' }}>
                Crie uma conta
              </Typography>
            </Link>
          </Typography>
        </Box>
      </Card>
    </Container>
  );
}

export default function LoginPage() {
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F5F9',
        p: 4,
      }}
    >
      <Suspense fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <CircularProgress />
        </Box>
      }>
        <LoginContent />
      </Suspense>
    </Box>
  );
}
