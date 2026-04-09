// Custom commands for Cypress
// Example: cy.login() can be added here

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
    }
  }
}

Cypress.Commands.add('login', (email: string, password: string) => {
  // implement login helper if needed by tests
  cy.request('POST', 'http://localhost:8000/api/v1/auth/login', { username: email, password })
    .then((resp) => {
      // store token for app usage
      const token = resp.body.get('access_token') || resp.body.access_token
      window.localStorage.setItem('access_token', token)
    })
})

export {}
