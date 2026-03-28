import useSWR from 'swr';
import { organizationService } from '../services/organizationService';
import { Organization } from '../types/organization.types';

export function useOrganizations() {
  const { data, error, isLoading, mutate } = useSWR<Organization[]>(
    'organizations',
    () => organizationService.list()
  );

  return {
    organizations: data || [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}
