package com.crisischord.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.crisischord.entity.VolunteerTask;
import com.crisischord.repository.VolunteerTaskRepository;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/volunteer")
public class VolunteerController {

    private final VolunteerTaskRepository taskRepo;

    public VolunteerController(VolunteerTaskRepository taskRepo) {
        this.taskRepo = taskRepo;
    }

    @GetMapping("/tasks/{volunteerId}")
    public List<VolunteerTask> tasks(@PathVariable Long volunteerId) {
        return taskRepo.findByVolunteerId(volunteerId);
    }

    @PostMapping("/tasks")
    public VolunteerTask createTask(@RequestBody VolunteerTask t) {
        t.setStatus("PENDING");
        return taskRepo.save(t);
    }

    @PutMapping("/tasks/{id}/status")
    public ResponseEntity<VolunteerTask> updateStatus(@PathVariable Long id, @RequestParam String status) {
        Optional<VolunteerTask> optTask = taskRepo.findById(id);

        if(optTask.isPresent()) {
            VolunteerTask t = optTask.get();
            t.setStatus(status);
            taskRepo.save(t);
            return ResponseEntity.ok(t);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}

