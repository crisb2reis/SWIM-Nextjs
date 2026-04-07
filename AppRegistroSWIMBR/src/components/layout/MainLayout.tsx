'use client';

/**
 * src/components/layout/MainLayout.tsx
 * Layout principal sincronizando Sidebar, Header e conteúdo.
 */

import { ReactNode, useState, useEffect, useContext } from 'react';
import useSWR from 'swr';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/axios';
import { ColorModeContext } from '../../app/[locale]/MuiProvider';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  useTheme, 
  useMediaQuery, 
  Drawer,
  Menu,
  MenuItem,
  Button
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import LanguageIcon from '@mui/icons-material/Language';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { Sidebar } from './Sidebar';
import { InputBase, alpha, styled } from '@mui/material';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: '12px',
  backgroundColor: theme.palette.common.white,
  '&:hover': {
    backgroundColor: '#fdfdfd',
    borderColor: '#80879e',
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  border: '1px solid #DBDADE',
  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
  transition: 'all 0.2s',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    fontSize: '0.875rem',
    [theme.breakpoints.up('md')]: {
      width: '40ch',
    },
  },
}));

const SIDEBAR_WIDTH = 270;

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const t = useTranslations('common');
  const locale = useLocale();
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopVisible, setDesktopVisible] = useState(true);
  const colorMode = useContext(ColorModeContext);

  // Busca de Usuário logado via useSWR (Cacheada e Automática)
  const { data: user } = useSWR('/api/v1/users/me', (url) => api.get(url).then(res => res.data));

  const fullName = user 
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username 
    : 'Carregando...';
  const initials = user 
    ? (user.first_name?.[0] || user.username[0]).toUpperCase() 
    : '...';

  // Controle do menu de idiomas
  const [langAnchor, setLangAnchor] = useState<null | HTMLElement>(null);
  const handleOpenLang = (event: React.MouseEvent<HTMLButtonElement>) => setLangAnchor(event.currentTarget);
  const handleCloseLang = () => setLangAnchor(null);
  const handleChangeLang = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale as any });
    handleCloseLang();
  };

  const [searchValue, setSearchValue] = useState(searchParams.get('q') || '');

  const handleToggleSidebar = () => {
    if (isDesktop) {
      setDesktopVisible(!desktopVisible);
    } else {
      setMobileOpen(!mobileOpen);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set('q', value);
    else params.delete('q');
    
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Menu do usuário e função de logout
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => setUserMenuAnchor(event.currentTarget);
  const handleCloseUserMenu = () => setUserMenuAnchor(null);

  const handleLogout = async () => {
    try {
      await api.post('/api/v1/auth/logout');
    } catch (err) {
      console.error('Erro ao chamar endpoint de logout', err);
    } finally {
      localStorage.removeItem('token');
      handleCloseUserMenu();
      router.push('/login');
    }
  };

  const currentSidebarWidth = desktopVisible && isDesktop ? SIDEBAR_WIDTH : 0;

  const currentLangLabel = {
    pt: 'Português',
    en: 'English',
    es: 'Español'
  }[locale] || 'Idioma';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      
      {/* Sidebar Desktop (Persistent) */}
      <Drawer
        variant={isDesktop ? 'persistent' : 'temporary'}
        anchor="left"
        open={isDesktop ? desktopVisible : mobileOpen}
        onClose={handleToggleSidebar}
        ModalProps={{ keepMounted: true }} 
        sx={{
          width: desktopVisible ? SIDEBAR_WIDTH : 0,
          flexShrink: 0,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: SIDEBAR_WIDTH,
            borderRight: 'none',
          },
        }}
      >
        <Sidebar />
      </Drawer>

      {/* Área principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${currentSidebarWidth}px)` },
          marginLeft: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {/* Header Superior */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: alpha(theme.palette.background.default, 0.95),
            backdropFilter: 'blur(10px)',
            borderBottom: `1px solid ${theme.palette.divider}`,
            color: 'text.primary',
            zIndex: theme.zIndex.drawer - 1,
          }}
        >
          <Toolbar sx={{ px: 4, height: 80 }}>
            <IconButton edge="start" color="inherit" onClick={handleToggleSidebar} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            
            <Search>
              <SearchIconWrapper>
                <SearchIcon fontSize="small" />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder={t('searchAll')}
                value={searchValue}
                onChange={handleSearchChange}
                inputProps={{ 'aria-label': 'search' }}
              />
            </Search>

            <Box sx={{ flexGrow: 1 }} />

            {/* Ações do cabeçalho */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                
                {/* Toggle Dark/Light Mode */}
                <IconButton onClick={colorMode.toggleColorMode} color="inherit">
                  {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>

                {/* Seletor de Idioma */}
                <Button
                  startIcon={<LanguageIcon />}
                  onClick={handleOpenLang}
                  sx={{ color: 'text.secondary', textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' }}
                >
                  {currentLangLabel}
                </Button>
                <Menu
                  anchorEl={langAnchor}
                  open={Boolean(langAnchor)}
                  onClose={handleCloseLang}
                  sx={{ mt: 1 }}
                >
                  <MenuItem onClick={() => handleChangeLang('pt')}>Português</MenuItem>
                  <MenuItem onClick={() => handleChangeLang('en')}>English</MenuItem>
                  <MenuItem onClick={() => handleChangeLang('es')}>Español</MenuItem>
                </Menu>

                <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                  <Typography variant="body2" fontWeight={800} sx={{ lineHeight: 1 }}>
                    {fullName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('admin')}
                  </Typography>
                </Box>
                <Box 
                  onClick={handleOpenUserMenu}
                  sx={{ 
                    width: 44, 
                    height: 44, 
                    borderRadius: '50%', 
                    bgcolor: 'primary.main', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    boxShadow: '0 4px 10px rgba(37, 56, 101, 0.3)',
                    cursor: 'pointer'
                  }}
                >
                  {initials}
                </Box>
                <Menu
                  anchorEl={userMenuAnchor}
                  open={Boolean(userMenuAnchor)}
                  onClose={handleCloseUserMenu}
                  sx={{ mt: 1 }}
                >
                  <MenuItem onClick={handleLogout}>Sair</MenuItem>
                </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Conteúdo da Página */}
        <Box sx={{ p: { xs: 2, sm: 4, md: 6 }, flexGrow: 1 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
