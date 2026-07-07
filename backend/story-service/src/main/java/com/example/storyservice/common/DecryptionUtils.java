package com.example.storyservice.common;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.Base64;

public class DecryptionUtils {

    public static String decrypt(String cipherTextB64, String passphrase) throws Exception {
        byte[] cipherBytes = Base64.getDecoder().decode(cipherTextB64);
        
        // Check for 'Salted__'
        String saltHeader = new String(Arrays.copyOfRange(cipherBytes, 0, 8), StandardCharsets.UTF_8);
        if (!saltHeader.equals("Salted__")) {
            throw new Exception("Invalid salt header");
        }
        
        byte[] salt = Arrays.copyOfRange(cipherBytes, 8, 16);
        byte[] encrypted = Arrays.copyOfRange(cipherBytes, 16, cipherBytes.length);

        // Derive key and IV
        byte[] key = new byte[32];
        byte[] iv = new byte[16];
        
        MessageDigest md = MessageDigest.getInstance("MD5");
        byte[] hash = new byte[0];
        byte[] derivedBuffer = new byte[48];
        int derivedLen = 0;
        
        while (derivedLen < 48) {
            md.update(hash);
            md.update(passphrase.getBytes(StandardCharsets.UTF_8));
            md.update(salt);
            hash = md.digest();
            
            int len = Math.min(hash.length, 48 - derivedLen);
            System.arraycopy(hash, 0, derivedBuffer, derivedLen, len);
            derivedLen += len;
        }
        
        System.arraycopy(derivedBuffer, 0, key, 0, 32);
        System.arraycopy(derivedBuffer, 32, iv, 0, 16);
        
        // Decrypt
        SecretKeySpec keySpec = new SecretKeySpec(key, "AES");
        IvParameterSpec ivSpec = new IvParameterSpec(iv);
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        cipher.init(Cipher.DECRYPT_MODE, keySpec, ivSpec);
        
        byte[] decrypted = cipher.doFinal(encrypted);
        return new String(decrypted, StandardCharsets.UTF_8);
    }

    public static String encrypt(String plainText, String passphrase) throws Exception {
        byte[] salt = new byte[8];
        new java.security.SecureRandom().nextBytes(salt);
        
        byte[] key = new byte[32];
        byte[] iv = new byte[16];
        
        MessageDigest md = MessageDigest.getInstance("MD5");
        byte[] hash = new byte[0];
        byte[] derivedBuffer = new byte[48];
        int derivedLen = 0;
        
        while (derivedLen < 48) {
            md.update(hash);
            md.update(passphrase.getBytes(StandardCharsets.UTF_8));
            md.update(salt);
            hash = md.digest();
            
            int len = Math.min(hash.length, 48 - derivedLen);
            System.arraycopy(hash, 0, derivedBuffer, derivedLen, len);
            derivedLen += len;
        }
        
        System.arraycopy(derivedBuffer, 0, key, 0, 32);
        System.arraycopy(derivedBuffer, 32, iv, 0, 16);
        
        SecretKeySpec keySpec = new SecretKeySpec(key, "AES");
        IvParameterSpec ivSpec = new IvParameterSpec(iv);
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, keySpec, ivSpec);
        
        byte[] encrypted = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
        
        byte[] finalResult = new byte[16 + encrypted.length];
        System.arraycopy("Salted__".getBytes(StandardCharsets.UTF_8), 0, finalResult, 0, 8);
        System.arraycopy(salt, 0, finalResult, 8, 8);
        System.arraycopy(encrypted, 0, finalResult, 16, encrypted.length);
        
        return Base64.getEncoder().encodeToString(finalResult);
    }
}
