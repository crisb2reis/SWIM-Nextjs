'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

export default function LoginPage() {
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
      // ─── LOGIN FAKE PARA DESENVOLVIMENTO ──────────────────────────────────────
      if (username === 'admin' && password === 'admin') {
        localStorage.setItem('token', 'fake-dev-token-swimb');
        router.push('/utility/document/documentTable');
        return;
      }
      // ──────────────────────────────────────────────────────────────────────────

      const response = await api.post('/users/login/', { username, password });
      const token = response.data.token || response.data.auth_token;

      if (token) {
        localStorage.setItem('token', token);
        router.push('/utility/document/documentTable');
      } else {
        setError('Falha ao obter token de acesso.');
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        err.response?.data?.error || 
        'Credenciais inválidas ou erro no servidor.'
      );
    } finally {
      setLoading(false);
    }
  };

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
              />

              <TextField
                fullWidth
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
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
              Nova plataforma? <Typography component="span" variant="body2" sx={{ color: 'primary.main', cursor: 'pointer', fontWeight: 600 }}>Crie uma conta</Typography>
            </Typography>
          </Box>
        </Card>
      </Container>
    </Box>
  );
}
