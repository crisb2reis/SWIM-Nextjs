'use client';

import { useState } from 'react';
import { 
  Box, 
  TextField, 
  MenuItem, 
  IconButton, 
  Tooltip,
  Paper,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import { useTranslations } from 'next-intl';

export interface LogFilterValues {
  search?: string;
  severity?: string;
  event_type?: string;
}

interface LogFiltersProps {
  onFilterChange: (filters: LogFilterValues) => void;
}

export function LogFilters({ onFilterChange }: LogFiltersProps) {
  const t = useTranslations('logs.filters');
  const commonT = useTranslations('common');
  
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('');

  const handleSearchChange = (val: string) => {
    setSearch(val);
    onFilterChange({ search: val, severity });
  };

  const handleSeverityChange = (val: string) => {
    setSeverity(val);
    onFilterChange({ search, severity: val });
  };

  const clearFilters = () => {
    setSearch('');
    setSeverity('');
    onFilterChange({});
  };

  return (
    <Box 
      component={Paper} 
      elevation={0}
      sx={{ 
        p: 2, 
        mb: 3, 
        display: 'flex', 
        gap: 2, 
        alignItems: 'center', 
        flexWrap: 'wrap',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <TextField
        size="small"
        placeholder={t('searchPlaceholder')}
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
        sx={{ minWidth: 300 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" color="action" />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        select
        size="small"
        label={t('severity')}
        value={severity}
        onChange={(e) => handleSeverityChange(e.target.value)}
        sx={{ minWidth: 150 }}
      >
        <MenuItem value="">{t('all')}</MenuItem>
        <MenuItem value="INFO">INFO</MenuItem>
        <MenuItem value="WARNING">WARNING</MenuItem>
        <MenuItem value="ERROR">ERROR</MenuItem>
        <MenuItem value="CRITICAL">CRITICAL</MenuItem>
      </TextField>

      <Box sx={{ flexGrow: 1 }} />

      <Tooltip title={t('clearFilters')}>
        <IconButton onClick={clearFilters} color="primary" size="small">
          <FilterListOffIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
