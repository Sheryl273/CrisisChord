package com.crisischord.controller;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.crisischord.entity.Incident;
import com.crisischord.service.IncidentService;
import com.crisischord.repository.IncidentRepository;
import java.util.List;

@RestController
@RequestMapping("/api/incidents")
public class IncidentController {

    private final IncidentService incidentService;
    public IncidentController(IncidentService incService, IncidentRepository incRepo) {
        this.incidentService = incService;
    }

    @PostMapping("/report")
    public ResponseEntity<Incident> report(
        @RequestPart("meta") Incident meta,
        @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        Incident saved = incidentService.reportIncident(meta, image);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping
    public List<Incident> list() { return incidentService.allIncidents(); }

    @GetMapping("/{id}")
    public ResponseEntity<Incident> get(@PathVariable Long id) {
        return incidentService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Incident> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return incidentService.getById(id).map(inc -> {
            inc.setStatus(status);
            incidentService.save(inc);
            return ResponseEntity.ok(inc);
        }).orElse(ResponseEntity.notFound().build());
    }
}

