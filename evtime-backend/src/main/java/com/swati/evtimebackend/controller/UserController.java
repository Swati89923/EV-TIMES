package com.swati.evtimebackend.controller;

import com.swati.evtimebackend.dto.UserResponseDTO;
import com.swati.evtimebackend.entity.User;
import com.swati.evtimebackend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
public class UserController {

    private final UserService userService;

    public UserController(UserService userService){
        this.userService = userService;
    }

    @PostMapping("/signup")
    public UserResponseDTO signup(
            @Valid @RequestBody User user){

        User savedUser = userService.registerUser(user);

        return new UserResponseDTO(
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole()
        );
    }

    @PostMapping("/login")
    public UserResponseDTO loginUser(
            @RequestBody User user){

        return userService.loginUser(
                user.getEmail(),
                user.getPassword()
        );
    }
}