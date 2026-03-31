describe('Auth E2E', () => {
  it('seeds DB and opens homepage', () => {
    // Seed backend (requires backend running with ALLOW_TEST_ENDPOINTS=true)
    cy.request('POST', 'http://localhost:8000/api/v1/test/seed').its('status').should('eq', 200)

    // Visit frontend
    cy.visit('/')
    cy.url().should('include', '/')
  })
})
