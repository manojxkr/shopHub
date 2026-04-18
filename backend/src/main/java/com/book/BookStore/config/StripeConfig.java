package com.book.BookStore.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import com.stripe.Stripe;

import jakarta.annotation.PostConstruct;

@Configuration
public class StripeConfig {

    @Value("${stripe.secret.key:sk_test_your_stripe_secret_key_here}")
    private String stripeSecretKey;

    @PostConstruct
    public void initStripe() {
        Stripe.apiKey = stripeSecretKey;
    }
}