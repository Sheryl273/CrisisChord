package com.crisischord.repository;

import com.crisischord.entity.User;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findByRole(String role);
}

