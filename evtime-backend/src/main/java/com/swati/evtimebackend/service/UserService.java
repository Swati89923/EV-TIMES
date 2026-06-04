package com.swati.evtimebackend.service;
import com.swati.evtimebackend.entity.User;
import com.swati.evtimebackend.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.Optional;
import com.swati.evtimebackend.security.JwtUtil;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    public UserService(UserRepository userRepository, JwtUtil jwtUtil){
        this.userRepository=userRepository;
        this.jwtUtil = jwtUtil;
    }
    public User registerUser(User user){
        return userRepository.save(user);
    }

    public String loginUser(String email, String password){
        Optional<User> user = userRepository.findByEmail(email);

        if(user.isPresent() && user.get().getPassword().equals(password)) {
            return jwtUtil.generateToken(email);
        }
        return "Invalid Credential";
    }
}
