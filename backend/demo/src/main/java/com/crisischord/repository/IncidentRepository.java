package com.crisischord.repository;

import com.crisischord.entity.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {

    // Custom query: get all incidents by status
    List<Incident> findByStatus(String status);

    // findById is already provided by JpaRepository; no need to redefine it
}
