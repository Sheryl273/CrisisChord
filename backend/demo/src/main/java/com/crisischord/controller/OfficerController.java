package com.crisischord.controller;

import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.crisischord.dto.AssignDTO;
import com.crisischord.entity.Incident;
import com.crisischord.service.IncidentService;

@RestController
@RequestMapping("/api/officer")
public class OfficerController {

    private final IncidentService incidentService;

    public OfficerController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @PostMapping("/assign")
    public ResponseEntity<?> assign(@RequestBody AssignDTO assign) {
        Optional<Incident> opt = incidentService.getById(assign.getIncidentId());
        if(opt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid incident id");
        }

        Incident inc = opt.get();

        if(assign.getOfficerId() != null) {
            inc.setAssignedVolunteerId(assign.getOfficerId());
        }

        if(assign.getVolunteerId() != null) {
            inc.setAssignedVolunteerId(assign.getVolunteerId());
        }

        inc.setStatus("ASSIGNED");
        incidentService.save(inc);

        return ResponseEntity.ok(inc);
    }
}
