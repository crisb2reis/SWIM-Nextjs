'use client';

import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Skeleton,
  useTheme
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import TimerIcon from '@mui/icons-material/Timer';
import { useTranslations } from 'next-intl';

interface LogStatisticsPanelProps {
  stats: any;
  isLoading: boolean;
}

export function LogStatisticsPanel({ stats, isLoading }: LogStatisticsPanelProps) {
  const t = useTranslations('logs.statistics');
  const theme = useTheme();

  const statCards = [
    {
      title: t('totalEvents'),
      value: stats?.total_logs || 0,
      icon: <AssessmentIcon sx={{ color: theme.palette.primary.main }} />,
      color: theme.palette.primary.light
    },
    {
      title: t('totalErrors'),
      value: stats?.error_count_24h || 0,
      icon: <ErrorOutlineIcon sx={{ color: theme.palette.error.main }} />,
      color: theme.palette.error.light
    },
    {
      title: t('avgResponse'),
      value: `${stats?.avg_response_time?.toFixed(1) || 0}ms`,
      icon: <TimerIcon sx={{ color: theme.palette.warning.main }} />,
      color: theme.palette.warning.light
    }
  ];

  return (
    <Grid container spacing={3} mb={4}>
      {statCards.map((card, index) => (
        <Grid size={{ xs: 12, md: 4 }} key={index}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              borderRadius: 3, 
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, rgba(255,255,255,0.05) 100%)`,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.05)'
              }
            }}
          >
            <Box sx={{ 
              backgroundColor: card.color + '20', // transparent version
              p: 1.5, 
              borderRadius: 2,
              display: 'flex'
            }}>
              {card.icon}
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                {card.title}
              </Typography>
              {isLoading ? (
                <Skeleton width={60} height={40} />
              ) : (
                <Typography variant="h5" fontWeight={800}>
                  {card.value}
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
