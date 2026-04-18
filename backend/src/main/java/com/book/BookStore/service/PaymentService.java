package com.book.BookStore.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.book.BookStore.entity.Order;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;

@Service
public class PaymentService {

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    public PaymentIntent createPaymentIntent(Order order) throws StripeException {
        Stripe.apiKey = stripeSecretKey;

        long amountInCents = (long) (order.getTotalAmount() * 100); // Convert to cents

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency("usd")
                .putMetadata("orderId", String.valueOf(order.getId()))
                .putMetadata("userId", String.valueOf(order.getUser().getId()))
                .build();

        return PaymentIntent.create(params);
    }

    public PaymentIntent confirmPaymentIntent(String paymentIntentId) throws StripeException {
        PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
        return paymentIntent.confirm();
    }

    public PaymentIntent getPaymentIntent(String paymentIntentId) throws StripeException {
        return PaymentIntent.retrieve(paymentIntentId);
    }
}