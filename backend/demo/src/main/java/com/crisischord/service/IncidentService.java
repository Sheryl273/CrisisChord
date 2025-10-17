package com.crisischord.service;

import com.crisischord.entity.Incident;
import com.crisischord.repository.IncidentRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Service
public class IncidentService {

    private final IncidentRepository incidentRepo;
    private final FileStorageService storage;

    // Constructor injection
    public IncidentService(IncidentRepository incidentRepo, FileStorageService storage) {
        this.incidentRepo = incidentRepo;
        this.storage = storage;
    }

    // Report a new incident with optional image
    public Incident reportIncident(Incident incident, MultipartFile imageFile) {
        if (imageFile != null && !imageFile.isEmpty()) {
            String stored = storage.storeFile(imageFile, "incident");
            incident.setImagePath(stored);
        }
        return incidentRepo.save(incident);
    }

    // Get all incidents
    public List<Incident> allIncidents() {
        return incidentRepo.findAll();
    }

    // Get an incident by its ID
    public Optional<Incident> getById(Long id) {
        return incidentRepo.findById(id);
    }

    // Save or update an incident
    public Incident save(Incident incident) {
        return incidentRepo.save(incident);
    }

    // Delete an incident by ID
    public void delete(Long id) {
        incidentRepo.deleteById(id);
    }

    // Get all incidents by their status
    public List<Incident> byStatus(String status) {
        return incidentRepo.findByStatus(status);
    }
}
