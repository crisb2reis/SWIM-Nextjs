'use client';

/**
 * src/components/layout/Sidebar.tsx
 * Sidebar premium baseado no design solicitado.
 */

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Collapse,
  Badge,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FlightIcon from '@mui/icons-material/Flight';

import { navigationItems, type NavItem } from '@/configs/navigation';

const SIDEBAR_WIDTH = 270;

// Estilização customizada da Sidebar
const NavDrawer = styled(Drawer)(({ theme }) => ({
  width: SIDEBAR_WIDTH,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: SIDEBAR_WIDTH,
    boxSizing: 'border-box',
    backgroundColor: '#111827', // Black Navy ultra moderno
    color: '#9CA3AF',
    borderRight: 'none',
    boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
  },
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4, 3),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  background: 'linear-gradient(to bottom, rgba(31, 41, 55, 0.4) 0%, transparent 100%)',
  marginBottom: theme.spacing(2),
}));

const SectionHeader = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(3, 4, 1, 4),
  color: '#4B5563',
  fontSize: '0.7rem',
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.15rem',
}));

// Estilo do item de navegação
const StyledNavItem = styled(ListItemButton)(({ theme }) => ({
  margin: theme.spacing(0.4, 2),
  borderRadius: '12px',
  padding: theme.spacing(1.2, 2),
  transition: 'all 0.2s ease-in-out',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    color: '#FFFFFF',
    transform: 'translateX(4px)',
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
  },
  '&.Mui-selected': {
    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
    color: '#FFFFFF',
    boxShadow: `0 4px 12px rgba(37, 56, 101, 0.3)`,
    '& .MuiListItemIcon-root': {
      color: '#FFFFFF',
    },
    '&:hover': {
      background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
      opacity: 0.9,
    },
    // Tracinho lateral indicador
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      width: 4,
      height: '60%',
      backgroundColor: '#FFFFFF',
      borderRadius: '0 4px 4px 0',
    }
  },
}));

export function Sidebar() {
  const t = useTranslations('navigation');
  const router = useRouter();
  const pathname = usePathname();
  
  // Inicialização inteligente: abre o submenu correspondente ao caminho atual
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {
      documentacao: pathname.includes('/utility/document'),
    };
    
    navigationItems.forEach(item => {
      if (item.children?.some(child => pathname.startsWith(child.path ?? ''))) {
        initialState[item.id] = true;
      }
    });
    
    return initialState;
  });

  const handleToggleSubMenu = (id: string) => {
    setOpenSubMenus((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const renderNavItems = (items: NavItem[]) => {
    return items.map((item) => {
      // Caso seja apenas um cabeçalho de seção
      if (item.section === 'header') {
        const sectionTitle = t(item.id.replace('-section', ''));
        return <SectionHeader key={item.id}>{sectionTitle}</SectionHeader>;
      }

      const isSelected = pathname === item.path || (item.children?.some(child => pathname === child.path));
      const hasChildren = !!item.children;
      const isOpen = openSubMenus[item.id];
      const itemTitle = t(item.id);

      return (
        <Box key={item.id}>
          <StyledNavItem
            selected={isSelected && !hasChildren}
            onClick={() => (hasChildren ? handleToggleSubMenu(item.id) : item.path && handleNavigate(item.path))}
          >
            {item.icon && (
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                <item.icon fontSize="small" />
              </ListItemIcon>
            )}
            <ListItemText 
              primary={itemTitle} 
              primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }} 
            />
            {hasChildren && (isOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />)}
          </StyledNavItem>

          {hasChildren && (
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding sx={{ ml: 4, mb: 1, position: 'relative' }}>
                {/* Linha vertical de conexão estilizada */}
                <Box sx={{ 
                  position: 'absolute', 
                  left: 14, 
                  top: 0, 
                  bottom: 12, 
                  width: '1px', 
                  bgcolor: 'rgba(255,255,255,0.1)' 
                }} />
                
                {item.children?.map((child) => (
                  <ListItemButton
                    key={child.id}
                    selected={pathname === child.path}
                    onClick={() => child.path && handleNavigate(child.path)}
                    sx={{
                      py: 1,
                      pl: 4,
                      borderRadius: 1,
                      mr: 2,
                      transition: 'all 0.2s',
                      color: pathname === child.path ? '#FFFFFF' : 'inherit',
                      '&:hover': { color: '#FFFFFF', backgroundColor: 'transparent' },
                      '&.Mui-selected': { 
                        color: '#FFFFFF',
                        bgcolor: 'transparent',
                        fontWeight: 700,
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: 12,
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          backgroundColor: (theme) => theme.palette.primary.main,
                        }
                      },
                    }}
                   >
                    <ListItemText 
                      primary={t(child.id.replace(`${item.id}-`, '').replace('doc-', ''))} 
                      primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 500 }} 
                    />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          )}
        </Box>
      );
    });
  };

  return (
    <NavDrawer variant="permanent" anchor="left">
      {/* Logos no topo */}
      <LogoContainer>
        <Box sx={{ 
          bgcolor: 'primary.main', 
          width: 38, 
          height: 38, 
          borderRadius: 1.5, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(37, 56, 101, 0.4)'
        }}>
          <FlightIcon sx={{ color: 'white' }} />
        </Box>
        <Box>
          <Typography variant="body1" fontWeight={800} sx={{ lineHeight: 1.1, color: '#FFFFFF' }}>
            REGISTRO
          </Typography>
          <Typography variant="body2" fontWeight={700} sx={{ opacity: 0.9, letterSpacing: 1 }}>
            SWIM BR
          </Typography>
        </Box>
      </LogoContainer>

      {/* Menu scrollável */}
      <Box sx={{ flexGrow: 1, mt: 2, overflowY: 'auto', '&::-webkit-scrollbar': { width: '4px' } }}>
        <List component="nav" disablePadding>
          {renderNavItems(navigationItems)}
        </List>
      </Box>

      {/* Logos no rodapé (FAB/DECEA) */}
      <Box sx={{ 
        p: 3, 
        mt: 'auto', 
        borderTop: '1px solid rgba(255,255,255,0.06)',
        backgroundColor: 'rgba(0,0,0,0.2)',
        mx: 1,
        mb: 2,
        borderRadius: 3,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box 
            component="img" 
            src="https://upload.wikimedia.org/wikipedia/pt/2/23/Escudo_do_DECEA.png"
            sx={{ width: 40, height: 40, filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.5))' }}
            onError={(e: any) => e.target.style.display = 'none'}
          />
          <Box>
            <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', fontSize: '0.62rem', fontWeight: 600 }}>
              FORÇA AÉREA BRASILEIRA
            </Typography>
            <Typography variant="body2" sx={{ color: '#E5E7EB', fontSize: '0.72rem', fontWeight: 800, lineHeight: 1.2 }}>
              DECEA / CONTROLE
            </Typography>
          </Box>
        </Box>
      </Box>
    </NavDrawer>
  );
}
