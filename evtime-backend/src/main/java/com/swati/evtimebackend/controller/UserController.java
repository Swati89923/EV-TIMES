package com.swati.evtimebackend.controller;
import com.swati.evtimebackend.entity.User;
import com.swati.evtimebackend.service.UserService;
import org.springframework.web.bind.annotation.*;

@RestController
public class UserController {
    private final UserService userService;

    public UserController(UserService userService){
        this.userService=userService;
    }
    @PostMapping("/signup")
    public User signup(@RequestBody User user){
        return userService.registerUser(user);
    }

    @PostMapping("/login")
    public String loginUser(@RequestBody User user){
        return userService.loginUser(user.getEmail(),user.getPassword());
    }
}
