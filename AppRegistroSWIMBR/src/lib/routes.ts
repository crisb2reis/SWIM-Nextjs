/**
 * Centralized routes configuration to maintain DRY across the application.
 */
export const ROUTES = {
  home: '/',
  organizations: {
    manage: '/utility/organization/manage',
    add: '/utility/organization/add',
  },
  services: {
    manage: '/utility/services/manage',
    add: '/utility/services/add',
  },
  contacts: {
    manage: '/utility/contacts/manage',
    add: '/utility/contacts/add',
  },
} as const;
