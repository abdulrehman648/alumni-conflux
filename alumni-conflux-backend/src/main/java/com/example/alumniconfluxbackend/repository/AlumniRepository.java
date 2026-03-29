package com.example.alumniconfluxbackend.repository;

import com.example.alumniconfluxbackend.model.Alumni;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AlumniRepository extends JpaRepository<Alumni, Integer> {
}
