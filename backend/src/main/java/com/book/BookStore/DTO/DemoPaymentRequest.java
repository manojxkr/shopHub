package com.book.BookStore.DTO;

/**
 * Demo-only body for POST /api/orders/{id}/pay-demo.
 * simulateFailure=true exercises a declined-card path (no stock deducted).
 */
public class DemoPaymentRequest {

    private boolean simulateFailure;

    public boolean isSimulateFailure() {
        return simulateFailure;
    }

    public void setSimulateFailure(boolean simulateFailure) {
        this.simulateFailure = simulateFailure;
    }
}
