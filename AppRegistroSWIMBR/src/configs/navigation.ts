/**
 * src/configs/navigation.ts
 * Configuração expandida com submenus para cada seção.
 */

import ListIcon from '@mui/icons-material/List';
import PeopleIcon from '@mui/icons-material/People';
import AppsIcon from '@mui/icons-material/Apps';
import BusinessIcon from '@mui/icons-material/Business';
import ArticleIcon from '@mui/icons-material/Article';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import InfoIcon from '@mui/icons-material/Info';

export interface NavItem {
  id: string;
  title: string;
  icon?: any;
  path?: string;
  section?: string;
  children?: NavItem[];
}

export const navigationItems: NavItem[] = [
  {
    id: 'servicos-section',
    title: 'SERVIÇOS',
    section: 'header',
  },
  {
    id: 'catalogo',
    title: 'Catálogo de Serviços',
    icon: ListIcon,
    children: [
      { id: 'catalogo-todos',     title: 'Todos os Serviços', path: '/utility/services/all' },
      { id: 'catalogo-gerenciar',  title: 'Gerenciar',          path: '/utility/services/manage' },
      { id: 'catalogo-adicionar',  title: 'Adicionar',          path: '/utility/services/add' },
    ],
  },
  {
    id: 'gerenciamento-section',
    title: 'GERENCIAMENTO',
    section: 'header',
  },
  {
    id: 'usuarios',
    title: 'Gestão de Usuários',
    icon: PeopleIcon,
    children: [
      { id: 'usuarios-gerenciar', title: 'Gerenciar',          path: '/utility/users/manage' },
      { id: 'usuarios-adicionar', title: 'Adicionar',          path: '/utility/users/add' },
    ],
  },
  {
    id: 'gestao-servicos',
    title: 'Gestão de Serviços',
    icon: AppsIcon,
    children: [
      { id: 'gestao-servicos-gerenciar', title: 'Gerenciar',   path: '/utility/services/manage' },
      { id: 'gestao-servicos-adicionar', title: 'Adicionar',   path: '/utility/services/add' },
    ],
  },
  {
    id: 'organizacao',
    title: 'Organização',
    icon: BusinessIcon,
    children: [
      { id: 'organizacao-gerenciar', title: 'Gerenciar',       path: '/utility/organization/manage' },
      { id: 'organizacao-adicionar', title: 'Adicionar',       path: '/utility/organization/add' },
    ],
  },
  {
    id: 'documentacao',
    title: 'Documentação',
    icon: ArticleIcon,
    children: [
      { id: 'doc-gerenciar', title: 'Gerenciar',               path: '/utility/document/documentTable' },
      { id: 'doc-adicionar', title: 'Adicionar',               path: '/utility/document/addDocument' },
      { id: 'doc-consultar', title: 'Consultar',               path: '/utility/document/viewdocuments' },
    ],
  },
  {
    id: 'contato',
    title: 'Pontos de Contato',
    icon: ContactPhoneIcon,
    children: [
      { id: 'contato-gerenciar', title: 'Gerenciar',           path: '/utility/contacts/manage' },
      { id: 'contato-adicionar', title: 'Adicionar',           path: '/utility/contacts/add' },
    ],
  },
  {
    id: 'informacoes-section',
    title: 'INFORMAÇÕES',
    section: 'header',
  },
  {
    id: 'sobre',
    title: 'Sobre o SWIM',
    icon: InfoIcon,
    path: '/utility/about',
  },
];
