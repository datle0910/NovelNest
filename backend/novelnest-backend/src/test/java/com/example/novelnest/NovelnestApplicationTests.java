package com.example.novelnest;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb;MODE=MySQL;NON_KEYWORDS=USER",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "app.jwt.secret=TestSecretKeyForJWTTokenGenerationAndValidation2024VeryLongSecretKey",
    "app.jwt.expiration-ms=86400000",
    "cloudinary.cloud-name=demo",
    "cloudinary.api-key=demo",
    "cloudinary.api-secret=demo"
})
class NovelnestApplicationTests {

    @Test
    void contextLoads() {
        // Verify that the Spring context loads without errors
    }
}
