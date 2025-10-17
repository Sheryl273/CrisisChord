package com.crisischord.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.crisischord.entity.VolunteerTask;
import java.util.List;

public interface VolunteerTaskRepository extends JpaRepository<VolunteerTask, Long> {
    List<VolunteerTask> findByVolunteerId(Long volunteerId);
    List<VolunteerTask> findByIncidentId(Long incidentId);
}

