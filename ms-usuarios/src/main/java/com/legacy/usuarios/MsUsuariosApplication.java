package com.legacy.usuarios;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class MsUsuariosApplication {

    public static void main(String[] args) {
        SpringApplication.run(MsUsuariosApplication.class, args);
    }

    @GetMapping("/api/test")
    public String test() {
        return "MS-Usuarios funcionando correctamente!";
    }
}
