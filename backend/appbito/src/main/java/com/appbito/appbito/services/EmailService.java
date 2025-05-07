package com.appbito.appbito.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.verification.email.url}")
    private String verificationUrl;

    public EmailService(JavaMailSender mailSender){
        this.mailSender = mailSender;
    }

    public void sendVerificationEmail(String to, String token){
        String link = verificationUrl + token;
        String subject = "Verify your account";
        String body = "<p>Click the link below to verify your account:</p>"
            + "<a href=\"" + link + "\">Verify your account</a>";

        try{
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true);
            mailSender.send(message);
        }catch(MessagingException e){
            e.printStackTrace();
        }
    }

}
