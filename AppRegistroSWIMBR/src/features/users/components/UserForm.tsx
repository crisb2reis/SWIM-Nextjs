'use client';

import {
  Grid,
  Box,
  IconButton,
  InputAdornment,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import BusinessIcon from '@mui/icons-material/Business';
import SecurityIcon from '@mui/icons-material/Security';
import GroupIcon from '@mui/icons-material/Group';
import PhoneIcon from '@mui/icons-material/Phone';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Control, FieldErrors } from 'react-hook-form';
import type { UserFormValues } from '../types/user.types';
import type { Organization } from '@/features/organizations/types/organization.types';
import { FormField } from '@/components/common/FormField';
import { SelectField } from '@/components/common/SelectField';
import { RadioFieldSimNao } from '@/components/common/RadioField';

// ─── Props ────────────────────────────────────────────────────────────────────

interface UserFormProps {
  control: Control<UserFormValues>;
  errors: FieldErrors<UserFormValues>;
  organizations?: Organization[];
  isLoadingOrgs?: boolean;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function UserForm({
  control,
  errors,
  organizations,
  isLoadingOrgs,
}: UserFormProps) {
  const t = useTranslations('registration');
  const userT = useTranslations('users.table');
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => setShowPassword(!showPassword);

  return (
    <Box component="div">
      <Grid container spacing={4}>
        {/* Linha 1: Nome e Telefone */}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormField
            name="nome"
            control={control}
            label={t('labels.nome')}
            placeholder={t('placeholders.nome')}
            icon={<PersonIcon fontSize="small" />}
            error={errors.nome}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormField
            name="telefone"
            control={control}
            label={t('labels.telefone')}
            placeholder="(61) 98888-7777"
            icon={<PhoneIcon fontSize="small" />}
            error={errors.telefone}
          />
        </Grid>

        {/* Linha 2: Email e Tipo de Usuário */}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormField
            name="email"
            control={control}
            label={t('labels.email')}
            placeholder={t('placeholders.email')}
            icon={<EmailIcon fontSize="small" />}
            error={errors.email}
            slotProps={{ type: 'email' }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SelectField
            name="tipoUsuario"
            control={control}
            label={t('labels.tipoUsuario')}
            error={errors.tipoUsuario}
            options={[
              { value: 'admin', label: userT('types.admin') },
              { value: 'usuario', label: userT('types.usuario') },
              { value: 'gestor', label: userT('types.gestor') },
            ]}
            slotProps={{
              InputProps: {
                startAdornment: (
                  <InputAdornment position="start">
                    <GroupIcon color="primary" fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>

        {/* Linha 3: Senha e Organização */}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormField
            name="senha"
            control={control}
            label={t('labels.senha')}
            icon={<LockIcon fontSize="small" />}
            error={errors.senha}
            slotProps={{
              type: showPassword ? 'text' : 'password',
              InputProps: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="ver senha"
                      onClick={handleTogglePassword}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SelectField
            name="organizacao"
            control={control}
            label={t('labels.organizacao')}
            error={errors.organizacao}
            options={isLoadingOrgs 
              ? [{ value: '', label: 'Carregando...' }] 
              : organizations?.map(org => ({
                  value: String(org.id),
                  label: org.acronym || org.name,
                })) || []
            }
            slotProps={{
              disabled: isLoadingOrgs, // Desabilita enquanto carrega
              InputProps: {
                startAdornment: (
                  <InputAdornment position="start">
                    <BusinessIcon color="primary" fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>

        {/* Linha 4: Radios (Militar/Ativar) e Tipo de Autorização */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <RadioFieldSimNao
                name="militar"
                control={control}
                label={t('labels.militar')}
                error={errors.militar}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <RadioFieldSimNao
                name="ativarUsuario"
                control={control}
                label={t('labels.ativar')}
                error={errors.ativarUsuario}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SelectField
            name="tipoAutorizacao"
            control={control}
            label={t('labels.tipoAutorizacao')}
            error={errors.tipoAutorizacao}
            options={[
              { value: 'total', label: userT('authLevels.total') },
              { value: 'parcial', label: userT('authLevels.parcial') },
              { value: 'restrita', label: userT('authLevels.restrita') },
            ]}
            slotProps={{
              InputProps: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SecurityIcon color="primary" fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
