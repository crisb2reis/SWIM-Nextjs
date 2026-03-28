'use client';

import { memo, useMemo } from 'react';
import {
  Box,
  Typography,
  Tooltip,
  IconButton,
  Avatar,
  useTheme,
} from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import { useTranslations } from 'next-intl';

import { User } from '../types/user.types';
import { BaseDataTable } from '@/components/common/table';

// ─── Células Customizadas ─────────────────────────────────────────────────────

/**
 * PERF-01 + PERF-03: Passando apenas strings (primitivos) em vez do objeto palette.
 * Isso garante que o memo funcione corretamente e evita re-renders desnecessários.
 */
const UserNomeCell = memo(function UserNomeCell({ 
  nome, 
  bgColor, 
  textColor 
}: { 
  nome: string; 
  bgColor: string; 
  textColor: string; 
}) {
  return (
    <Box display="flex" alignItems="center" gap={1.5}>
      <Avatar
        sx={{
          width: 32,
          height: 32,
          bgcolor: bgColor,
          color: textColor,
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        {nome ? nome.charAt(0).toUpperCase() : <PersonIcon fontSize="small" />}
      </Avatar>
      <Typography variant="body2" fontWeight={500}>
        {nome || '—'}
      </Typography>
    </Box>
  );
});

/**
 * QUAL-01: Strings hardcoded movidas para i18n.
 */
const StatusCell = memo(function StatusCell({ isActive }: { isActive: boolean }) {
  const t = useTranslations('users.table.status');
  
  return (
    <Box display="flex" alignItems="center" gap={0.5}>
      {isActive ? (
        <CheckCircleOutlineIcon sx={{ color: 'success.main', fontSize: 18 }} />
      ) : (
        <CancelOutlinedIcon sx={{ color: 'error.main', fontSize: 18 }} />
      )}
      <Typography variant="body2" color={isActive ? 'success.main' : 'error.main'} fontWeight={500}>
        {isActive ? t('active') : t('inactive')}
      </Typography>
    </Box>
  );
});

/**
 * SEC-02: Adicionado guard para 'level' e fallback seguro para dados malformados.
 * Valida o tipo em runtime para evitar TypeError em produção.
 */
const AuthLevelCell = memo(function AuthLevelCell({ level }: { level?: any }) {
  const t = useTranslations('users.table.authLevels');
  
  // SEC-02: Type guard robusto
  const safeLevel = (typeof level === 'string' ? level.toLowerCase() : 'unknown');

  const getLevelColor = (l: string) => {
    switch (l) {
      case 'total':
        return 'success.main';
      case 'parcial':
        return 'warning.main';
      case 'restrita':
        return 'error.main';
      default:
        return 'text.secondary';
    }
  };

  const labels: Record<string, string> = {
    total: t('total'),
    parcial: t('parcial'),
    restrita: t('restrita'),
    unknown: t('unknown'),
  };

  return (
    <Typography
      variant="body2"
      fontWeight={800}
      sx={{ color: getLevelColor(safeLevel) }}
    >
      {labels[safeLevel] || safeLevel.toUpperCase()}
    </Typography>
  );
});

const TypeIconCell = memo(function TypeIconCell({ type }: { type: string }) {
  const t = useTranslations('users.table.types');
  // PERF-02: Removido call de useTheme não utilizado.
  
  if (type === 'admin') {
    return (
      <Tooltip title={t('admin')}>
        <AdminPanelSettingsIcon sx={{ color: 'error.light', fontSize: 20 }} />
      </Tooltip>
    );
  }
  
  if (type === 'gestor') {
    return (
      <Tooltip title={t('gestor')}>
        <CloudQueueIcon sx={{ color: 'primary.main', fontSize: 20 }} />
      </Tooltip>
    );
  }

  return (
    <Tooltip title={t('usuario')}>
      <PersonIcon sx={{ color: 'info.main', fontSize: 20 }} />
    </Tooltip>
  );
});

// ─── Componente Principal ─────────────────────────────────────────────────────

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onEdit: (user: User) => void;
  // SEC-03: Nomeado como onDeleteConfirmRequest para maior clareza de que requer confirmação
  onDeleteConfirmRequest: (user: User) => void;
  onAdd: () => void;
}

export function UserTable({
  users,
  isLoading,
  isError,
  errorMessage,
  onEdit,
  onDeleteConfirmRequest,
  onAdd,
}: UserTableProps) {
  const t = useTranslations('users.table');
  const commonT = useTranslations('common');
  const a = useTranslations('actions');
  
  const theme = useTheme();
  
  // PERF-01: Extraindo cores como primitivos para otimizar dependências do useMemo
  const avatarBg = theme.palette.primary.light;
  const avatarColor = theme.palette.primary.contrastText;

  const columns = useMemo<GridColDef<User>[]>(
    () => [
      {
        field: 'nome',
        headerName: t('columns.name'),
        flex: 2,
        minWidth: 200,
        renderCell: ({ row }) => (
          <UserNomeCell 
            nome={row.nome} 
            bgColor={avatarBg} 
            textColor={avatarColor} 
          />
        ),
      },
      {
        field: 'email',
        headerName: t('columns.email'),
        flex: 1.5,
        minWidth: 180,
      },
      {
        field: 'organization',
        headerName: t('columns.organization'),
        flex: 1,
        minWidth: 120,
        valueGetter: (_params, row) => row.organization?.name || '—',
      },
      {
        field: 'is_active',
        headerName: t('columns.status'),
        width: 120,
        renderCell: ({ value }) => <StatusCell isActive={!!value} />,
      },
      {
        field: 'user_level_auth',
        headerName: t('columns.authLevel'),
        flex: 1,
        minWidth: 160,
        renderCell: ({ value }) => <AuthLevelCell level={value} />,
      },
      {
        field: 'user_type',
        headerName: t('columns.type'),
        width: 80,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ value }) => <TypeIconCell type={value} />,
      },
      {
        field: 'actions',
        headerName: t('columns.actions'),
        width: 100,
        sortable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Box display="flex" gap={0.5}>
            <IconButton 
              size="small" 
              onClick={() => onEdit(row)} 
              color="primary"
              aria-label={`${a('edit')} ${row.nome}`}
            >
              <EditTwoToneIcon fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              onClick={() => onDeleteConfirmRequest(row)} 
              color="error"
              aria-label={`${a('delete')} ${row.nome}`}
            >
              <DeleteTwoToneIcon fontSize="small" />
            </IconButton>
          </Box>
        ),
      },
    ],
    [t, a, avatarBg, avatarColor, onEdit, onDeleteConfirmRequest]
  );

  return (
    <BaseDataTable<User>
      rows={users}
      columns={columns}
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage || commonT('messages.error')}
      title={t('title')}
      subtitle={t('subtitle', { count: users.length })}
      onAdd={onAdd}
      addLabel={t('addLabel')}
      getRowId={(row) => row.id}
      rowsPerPageLabel={t('rowsPerPageLabel')}
    />
  );
}
