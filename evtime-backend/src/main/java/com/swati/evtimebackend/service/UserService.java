package com.swati.evtimebackend.service;

import com.swati.evtimebackend.entity.User;
import com.swati.evtimebackend.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.Optional;
import com.swati.evtimebackend.security.JwtUtil;
import com.swati.evtimebackend.dto.UserResponseDTO;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
@Service
public class UserService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder;
    public UserService(
            UserRepository userRepository,
            JwtUtil jwtUtil,
            BCryptPasswordEncoder passwordEncoder){

        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(User user){

        user.setRole("USER");

        return userRepository.save(user);
    }

    public UserResponseDTO loginUser(String email, String password){

        Optional<User> user = userRepository.findByEmail(email);

        if(user.isPresent() &&
                user.get().getPassword().equals(password)){

            String token =
                    jwtUtil.generateToken(
                            email,
                            user.get().getRole()
                    );

            return new UserResponseDTO(
                    token,
                    user.get().getEmail(),
                    user.get().getRole()
            );
        }

        return null;
    }
}