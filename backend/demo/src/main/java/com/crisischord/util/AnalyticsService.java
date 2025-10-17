package com.crisischord.util;

import org.springframework.stereotype.Service;
import com.crisischord.repository.IncidentRepository;
import java.util.*;
import com.crisischord.entity.Incident;

@Service
public class AnalyticsService {
    private final IncidentRepository repo;
    public AnalyticsService(IncidentRepository repo) { this.repo = repo; }

    public Map<String, Long> incidentsBySeverity() {
        List<Incident> all = repo.findAll();
        Map<String, Long> counts = new HashMap<>();
        for(Incident i: all) {
            counts.put(i.getSeverity(), counts.getOrDefault(i.getSeverity(), 0L) + 1);
        }
        return counts;
    }

    public Map<String, Long> incidentsByStatus() {
        List<Incident> all = repo.findAll();
        Map<String, Long> counts = new HashMap<>();
        for(Incident i: all) {
            counts.put(i.getStatus(), counts.getOrDefault(i.getStatus(), 0L) + 1);
        }
        return counts;
    }
}

