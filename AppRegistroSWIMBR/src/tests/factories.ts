// Factories and helpers para testes frontend

export function mockUser(overrides = {}) {
  return {
    id: 1,
    username: 'testuser',
    email: 'testuser@test.local',
    is_active: true,
    roles: ['user'],
    ...overrides,
  };
}

export function mockOrganization(overrides = {}) {
  return {
    id: 1,
    name: 'Org Test',
    acronym: 'OT',
    ...overrides,
  };
}

export function mockFile(name = 'file.txt', content = 'hello') {
  return new File([content], name, { type: 'text/plain' });
}

export default {
  mockUser,
  mockOrganization,
  mockFile,
};
