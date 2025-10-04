// // E2E tests for authentication functionality
// // Note: This assumes Cypress is configured and a test server is running

// describe('Authentication E2E Tests', () => {
//   beforeEach(() => {
//     // Clear localStorage and cookies before each test
//     cy.clearLocalStorage();
//     cy.clearCookies();

//     // Visit the application
//     cy.visit('/');
//   });

//   describe('Login Flow', () => {
//     it('should successfully login with valid credentials', () => {
//       // Intercept the login API call
//       cy.intercept('POST', '**/auth/login', { fixture: 'login-success.json' }).as('loginRequest');

//       // Fill in login form
//       cy.get('[data-cy="username-input"]').type('test@example.com');
//       cy.get('[data-cy="password-input"]').type('password123');

//       // Click login button
//       cy.get('[data-cy="login-button"]').click();

//       // Wait for the API call and verify success
//       cy.wait('@loginRequest').its('request.body').should('deep.equal', {
//         username: 'test@example.com',
//         password: 'password123',
//       });

//       // Verify user is redirected to dashboard
//       cy.url().should('include', '/dashboard');

//       // Verify tokens are stored
//       cy.window().then((win) => {
//         expect(win.localStorage.getItem('accessToken')).to.not.be.null;
//         expect(win.localStorage.getItem('refreshToken')).to.not.be.null;
//       });
//     });

//     it('should show error message with invalid credentials', () => {
//       // Intercept the login API call with error response
//       cy.intercept('POST', '**/auth/login', {
//         statusCode: 401,
//         body: { message: 'Invalid credentials' },
//       }).as('loginRequest');

//       // Fill in login form with invalid credentials
//       cy.get('[data-cy="username-input"]').type('invalid@example.com');
//       cy.get('[data-cy="password-input"]').type('wrongpassword');

//       // Click login button
//       cy.get('[data-cy="login-button"]').click();

//       // Wait for the API call
//       cy.wait('@loginRequest');

//       // Verify error message is displayed
//       cy.get('[data-cy="error-message"]').should('contain', 'Invalid credentials');

//       // Verify user is not redirected
//       cy.url().should('not.include', '/dashboard');

//       // Verify no tokens are stored
//       cy.window().then((win) => {
//         expect(win.localStorage.getItem('accessToken')).to.be.null;
//         expect(win.localStorage.getItem('refreshToken')).to.be.null;
//       });
//     });
//   });

//   describe('Registration Flow', () => {
//     it('should successfully register a new user', () => {
//       // Intercept the register API call
//       cy.intercept('POST', '**/auth/register', { fixture: 'register-success.json' }).as('registerRequest');

//       // Navigate to registration page
//       cy.get('[data-cy="register-link"]').click();

//       // Fill in registration form
//       cy.get('[data-cy="email-input"]').type('newuser@example.com');
//       cy.get('[data-cy="password-input"]').type('password123');
//       cy.get('[data-cy="firstName-input"]').type('New');
//       cy.get('[data-cy="lastName-input"]').type('User');
//       cy.get('[data-cy="userType-select"]').select('Customer');
//       cy.get('[data-cy="tenantId-input"]').type('tenant-1');

//       // Click register button
//       cy.get('[data-cy="register-button"]').click();

//       // Wait for the API call and verify success
//       cy.wait('@registerRequest');

//       // Verify success message or redirect to login
//       cy.get('[data-cy="success-message"]').should('contain', 'Registration successful');

//       // Verify no tokens are stored (registration doesn't auto-login)
//       cy.window().then((win) => {
//         expect(win.localStorage.getItem('accessToken')).to.be.null;
//         expect(win.localStorage.getItem('refreshToken')).to.be.null;
//       });
//     });
//   });

//   describe('Logout Flow', () => {
//     beforeEach(() => {
//       // Login first
//       cy.intercept('POST', '**/auth/login', { fixture: 'login-success.json' });
//       cy.get('[data-cy="username-input"]').type('test@example.com');
//       cy.get('[data-cy="password-input"]').type('password123');
//       cy.get('[data-cy="login-button"]').click();
//       cy.url().should('include', '/dashboard');
//     });

//     it('should successfully logout and clear session', () => {
//       // Intercept the logout API call
//       cy.intercept('POST', '**/auth/logout', {}).as('logoutRequest');

//       // Click logout button
//       cy.get('[data-cy="logout-button"]').click();

//       // Wait for the API call
//       cy.wait('@logoutRequest');

//       // Verify user is redirected to login page
//       cy.url().should('include', '/login');

//       // Verify tokens are cleared
//       cy.window().then((win) => {
//         expect(win.localStorage.getItem('accessToken')).to.be.null;
//         expect(win.localStorage.getItem('refreshToken')).to.be.null;
//       });
//     });
//   });

//   describe('Token Refresh', () => {
//     it('should handle token refresh during active session', () => {
//       // This test would require setting up a scenario where tokens expire
//       // and the app automatically refreshes them
//       // For now, this is a placeholder for the test structure

//       // Login first
//       cy.intercept('POST', '**/auth/login', { fixture: 'login-success.json' });
//       cy.get('[data-cy="username-input"]').type('test@example.com');
//       cy.get('[data-cy="password-input"]').type('password123');
//       cy.get('[data-cy="login-button"]').click();

//       // Simulate token expiration by clearing access token
//       cy.window().then((win) => {
//         win.localStorage.setItem('accessToken', 'expired-token');
//       });

//       // Intercept refresh token call
//       cy.intercept('POST', '**/auth/refresh', { fixture: 'refresh-success.json' }).as('refreshRequest');

//       // Perform an action that requires authentication
//       cy.get('[data-cy="protected-action"]').click();

//       // Wait for refresh call
//       cy.wait('@refreshRequest');

//       // Verify new tokens are stored
//       cy.window().then((win) => {
//         expect(win.localStorage.getItem('accessToken')).to.equal('new-access-token');
//         expect(win.localStorage.getItem('refreshToken')).to.equal('new-refresh-token');
//       });
//     });
//   });
// });