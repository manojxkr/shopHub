package com.book.BookStore.config;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;

import java.time.Duration;

@Configuration
@EnableCaching
public class RedisConfig {

    @Bean
    @SuppressWarnings("null")
    public CacheManager cacheManager(ObjectProvider<RedisConnectionFactory> connectionFactoryProvider,
            @Value("${spring.redis.enabled:false}") boolean redisEnabled) {
        if (redisEnabled) {
            RedisConnectionFactory connectionFactory = connectionFactoryProvider.getIfAvailable();
            if (connectionFactory != null) {
                RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                        .entryTtl(Duration.ofHours(1)) // Default TTL 1 hour
                        .serializeValuesWith(RedisSerializationContext.SerializationPair
                                .fromSerializer(new GenericJackson2JsonRedisSerializer()));

                return RedisCacheManager.builder(connectionFactory)
                        .cacheDefaults(config)
                        .build();
            }
        }

        return new ConcurrentMapCacheManager();
    }
}