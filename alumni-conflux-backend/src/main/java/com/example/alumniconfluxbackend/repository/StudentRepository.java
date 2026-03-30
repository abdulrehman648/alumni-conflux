package com.example.alumniconfluxbackend.repository;

import com.example.alumniconfluxbackend.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Integer> {
    Optional<Student> findByUserId(Integer userId);
}
