// describe('Payment Management E2E Tests', () => {
//   beforeEach(() => {
//     // Reset application state before each test
//     cy.clearLocalStorage();
//     cy.clearCookies();

//     // Visit the application
//     cy.visit('/');

//     // Login as a test user (assuming login functionality exists)
//     cy.get('[data-cy="email-input"]').type('test@example.com');
//     cy.get('[data-cy="password-input"]').type('password123');
//     cy.get('[data-cy="login-button"]').click();

//     // Wait for login to complete
//     cy.url().should('not.include', '/login');
//   });

//   describe('Payment History Viewing', () => {
//     it('should display payment history for logged-in user', () => {
//       // Navigate to payment history page
//       cy.get('[data-cy="nav-payments"]').click();
//       cy.url().should('include', '/payments');

//       // Verify payment list is displayed
//       cy.get('[data-cy="payment-list"]').should('be.visible');

//       // Check if payments are loaded (may be empty for test user)
//       cy.get('[data-cy="payment-item"]').should('have.length.greaterThan', -1);

//       // Test filtering functionality
//       cy.get('[data-cy="status-filter"]').select('Completed');
//       cy.get('[data-cy="apply-filter"]').click();

//       // Verify filtered results
//       cy.get('[data-cy="payment-item"]').each(($item) => {
//         cy.wrap($item).find('[data-cy="payment-status"]').should('contain', 'Completed');
//       });
//     });

//     it('should handle pagination for large payment lists', () => {
//       // Navigate to payments page
//       cy.get('[data-cy="nav-payments"]').click();

//       // Check pagination controls
//       cy.get('[data-cy="pagination"]').should('be.visible');

//       // Test pagination navigation
//       cy.get('[data-cy="page-next"]').click();
//       cy.url().should('include', 'page=2');

//       // Verify page content changes
//       cy.get('[data-cy="current-page"]').should('contain', '2');
//     });
//   });

//   describe('Payment Processing', () => {
//     it('should process a payment for a booking', () => {
//       // Navigate to bookings page
//       cy.get('[data-cy="nav-bookings"]').click();

//       // Select a pending booking
//       cy.get('[data-cy="booking-item"]').first().click();

//       // Click pay now button
//       cy.get('[data-cy="pay-now-button"]').click();

//       // Fill payment form
//       cy.get('[data-cy="card-number"]').type('4111111111111111');
//       cy.get('[data-cy="expiry-month"]').select('12');
//       cy.get('[data-cy="expiry-year"]').select('2025');
//       cy.get('[data-cy="cvv"]').type('123');
//       cy.get('[data-cy="cardholder-name"]').type('John Doe');

//       // Submit payment
//       cy.get('[data-cy="submit-payment"]').click();

//       // Verify payment success
//       cy.get('[data-cy="payment-success"]').should('be.visible');
//       cy.get('[data-cy="payment-confirmation"]').should('contain', 'Payment processed successfully');

//       // Verify booking status updated
//       cy.get('[data-cy="booking-status"]').should('contain', 'Confirmed');
//     });

//     it('should handle payment method selection', () => {
//       // Navigate to payment methods page
//       cy.get('[data-cy="nav-payment-methods"]').click();

//       // Add new payment method
//       cy.get('[data-cy="add-payment-method"]').click();

//       // Fill payment method form
//       cy.get('[data-cy="payment-method-type"]').select('CreditCard');
//       cy.get('[data-cy="card-number"]').type('5555555555554444');
//       cy.get('[data-cy="expiry-month"]').select('06');
//       cy.get('[data-cy="expiry-year"]').select('2026');
//       cy.get('[data-cy="cvv"]').type('456');
//       cy.get('[data-cy="cardholder-name"]').type('Jane Smith');

//       // Save payment method
//       cy.get('[data-cy="save-payment-method"]').click();

//       // Verify payment method added
//       cy.get('[data-cy="payment-method-item"]').should('contain', '****4444');
//       cy.get('[data-cy="payment-method-item"]').should('contain', 'Jane Smith');
//     });

//     it('should set default payment method', () => {
//       // Navigate to payment methods
//       cy.get('[data-cy="nav-payment-methods"]').click();

//       // Click set as default on a payment method
//       cy.get('[data-cy="set-default-button"]').first().click();

//       // Verify default indicator
//       cy.get('[data-cy="default-indicator"]').should('be.visible');
//       cy.get('[data-cy="default-indicator"]').should('contain', 'Default');
//     });
//   });

//   describe('Refund Processing', () => {
//     it('should process a refund for completed payment', () => {
//       // Navigate to payments page
//       cy.get('[data-cy="nav-payments"]').click();

//       // Find a completed payment
//       cy.get('[data-cy="payment-item"]').contains('Completed').first().click();

//       // Click refund button
//       cy.get('[data-cy="refund-button"]').click();

//       // Fill refund form
//       cy.get('[data-cy="refund-amount"]').clear().type('50');
//       cy.get('[data-cy="refund-reason"]').type('Customer requested partial refund');

//       // Submit refund
//       cy.get('[data-cy="submit-refund"]').click();

//       // Verify refund success
//       cy.get('[data-cy="refund-success"]').should('be.visible');
//       cy.get('[data-cy="refund-confirmation"]').should('contain', 'Refund processed successfully');

//       // Verify payment status updated
//       cy.get('[data-cy="payment-status"]').should('contain', 'Refunded');
//       cy.get('[data-cy="refund-amount-display"]').should('contain', '$50.00');
//     });

//     it('should handle full refund', () => {
//       // Navigate to payments
//       cy.get('[data-cy="nav-payments"]').click();

//       // Select completed payment
//       cy.get('[data-cy="payment-item"]').contains('Completed').first().click();

//       // Click full refund button
//       cy.get('[data-cy="full-refund-button"]').click();

//       // Confirm refund
//       cy.get('[data-cy="confirm-refund"]').click();

//       // Verify full refund processed
//       cy.get('[data-cy="refund-success"]').should('be.visible');
//       cy.get('[data-cy="payment-status"]').should('contain', 'Refunded');
//     });
//   });

//   describe('Error Handling', () => {
//     it('should handle payment processing errors', () => {
//       // Navigate to booking payment
//       cy.get('[data-cy="nav-bookings"]').click();
//       cy.get('[data-cy="booking-item"]').first().click();
//       cy.get('[data-cy="pay-now-button"]').click();

//       // Fill form with invalid data
//       cy.get('[data-cy="card-number"]').type('4000000000000002'); // Invalid card
//       cy.get('[data-cy="expiry-month"]').select('01');
//       cy.get('[data-cy="expiry-year"]').select('2020'); // Expired
//       cy.get('[data-cy="cvv"]').type('12'); // Invalid CVV
//       cy.get('[data-cy="cardholder-name"]').type('Test User');

//       // Submit payment
//       cy.get('[data-cy="submit-payment"]').click();

//       // Verify error handling
//       cy.get('[data-cy="payment-error"]').should('be.visible');
//       cy.get('[data-cy="error-message"]').should('contain', 'Payment failed');

//       // Verify user can retry
//       cy.get('[data-cy="retry-payment"]').should('be.visible');
//     });

//     it('should handle network errors gracefully', () => {
//       // Simulate network failure
//       cy.intercept('POST', '/payments', { forceNetworkError: true });

//       // Attempt payment
//       cy.get('[data-cy="nav-bookings"]').click();
//       cy.get('[data-cy="booking-item"]').first().click();
//       cy.get('[data-cy="pay-now-button"]').click();

//       // Fill valid payment form
//       cy.get('[data-cy="card-number"]').type('4111111111111111');
//       cy.get('[data-cy="expiry-month"]').select('12');
//       cy.get('[data-cy="expiry-year"]').select('2025');
//       cy.get('[data-cy="cvv"]').type('123');
//       cy.get('[data-cy="cardholder-name"]').type('Test User');

//       cy.get('[data-cy="submit-payment"]').click();

//       // Verify network error handling
//       cy.get('[data-cy="network-error"]').should('be.visible');
//       cy.get('[data-cy="retry-button"]').should('be.visible');
//     });

//     it('should handle unauthorized access', () => {
//       // Simulate session expiry
//       cy.clearLocalStorage();

//       // Try to access payments page
//       cy.visit('/payments');

//       // Should redirect to login
//       cy.url().should('include', '/login');
//       cy.get('[data-cy="login-required"]').should('be.visible');
//     });
//   });

//   describe('Payment Security', () => {
//     it('should not log sensitive payment information', () => {
//       // Navigate to payment form
//       cy.get('[data-cy="nav-bookings"]').click();
//       cy.get('[data-cy="booking-item"]').first().click();
//       cy.get('[data-cy="pay-now-button"]').click();

//       // Fill payment form
//       cy.get('[data-cy="card-number"]').type('4111111111111111');
//       cy.get('[data-cy="cvv"]').type('123');

//       // Submit payment
//       cy.get('[data-cy="submit-payment"]').click();

//       // Verify no sensitive data in logs (this would require checking browser console)
//       // In a real scenario, you might need to intercept network requests
//       cy.get('[data-cy="payment-success"]').should('be.visible');
//     });

//     it('should validate payment form inputs', () => {
//       // Navigate to payment form
//       cy.get('[data-cy="nav-bookings"]').click();
//       cy.get('[data-cy="booking-item"]').first().click();
//       cy.get('[data-cy="pay-now-button"]').click();

//       // Try to submit empty form
//       cy.get('[data-cy="submit-payment"]').click();

//       // Verify validation errors
//       cy.get('[data-cy="card-number-error"]').should('be.visible');
//       cy.get('[data-cy="expiry-error"]').should('be.visible');
//       cy.get('[data-cy="cvv-error"]').should('be.visible');
//       cy.get('[data-cy="cardholder-name-error"]').should('be.visible');

//       // Fill invalid data
//       cy.get('[data-cy="card-number"]').type('123');
//       cy.get('[data-cy="cvv"]').type('12');

//       // Submit again
//       cy.get('[data-cy="submit-payment"]').click();

//       // Verify specific validation messages
//       cy.get('[data-cy="card-number-error"]').should('contain', 'Invalid card number');
//       cy.get('[data-cy="cvv-error"]').should('contain', 'CVV must be 3 digits');
//     });
//   });

//   describe('Payment History Export', () => {
//     it('should allow exporting payment history', () => {
//       // Navigate to payments page
//       cy.get('[data-cy="nav-payments"]').click();

//       // Click export button
//       cy.get('[data-cy="export-payments"]').click();

//       // Verify export options
//       cy.get('[data-cy="export-format"]').should('be.visible');
//       cy.get('[data-cy="export-csv"]').click();

//       // Verify download initiated (this might require additional setup)
//       cy.get('[data-cy="export-success"]').should('be.visible');
//     });
//   });
// });