package com.example.novelnest.auth.repository;

import com.example.novelnest.auth.entity.PasswordResetOtp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PasswordResetOtpRepository extends JpaRepository<PasswordResetOtp, Long> {
    List<PasswordResetOtp> findByEmailAndUsedFalse(String email);
}
