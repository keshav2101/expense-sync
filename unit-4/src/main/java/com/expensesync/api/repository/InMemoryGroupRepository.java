package com.expensesync.api.repository;

import com.expensesync.api.model.dto.GroupResponseDTO;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Repository
public class InMemoryGroupRepository {

    private final Map<Long, GroupResponseDTO> groups = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(10);

    public InMemoryGroupRepository() {
        seedInitialGroups();
    }

    private void seedInitialGroups() {
        // Group 1: Goa Trip 2026
        GroupResponseDTO g1 = new GroupResponseDTO();
        g1.setId(1L);
        g1.setName("Goa Trip 2026");
        g1.setType("TRIP");
        g1.setCreatedBy(1L);
        g1.setCreatorName("Rahul Sharma");
        g1.setMembers(List.of(
                new GroupResponseDTO.MemberDTO(1L, "Rahul Sharma (You)", "rahul@example.com"),
                new GroupResponseDTO.MemberDTO(2L, "Priya Nair", "priya@example.com"),
                new GroupResponseDTO.MemberDTO(3L, "Amit Patel", "amit@example.com"),
                new GroupResponseDTO.MemberDTO(4L, "Sneha Rao", "sneha@example.com")
        ));
        Map<Long, BigDecimal> b1 = new HashMap<>();
        b1.put(1L, new BigDecimal("-1250.00"));
        b1.put(2L, new BigDecimal("3400.00"));
        b1.put(3L, new BigDecimal("-2150.00"));
        b1.put(4L, BigDecimal.ZERO);
        g1.setNetBalances(b1);
        groups.put(1L, g1);

        // Group 2: Flatmates B-302
        GroupResponseDTO g2 = new GroupResponseDTO();
        g2.setId(2L);
        g2.setName("Flatmates B-302");
        g2.setType("HOME");
        g2.setCreatedBy(1L);
        g2.setCreatorName("Rahul Sharma");
        g2.setMembers(List.of(
                new GroupResponseDTO.MemberDTO(1L, "Rahul Sharma (You)", "rahul@example.com"),
                new GroupResponseDTO.MemberDTO(3L, "Amit Patel", "amit@example.com"),
                new GroupResponseDTO.MemberDTO(4L, "Sneha Rao", "sneha@example.com")
        ));
        Map<Long, BigDecimal> b2 = new HashMap<>();
        b2.put(1L, new BigDecimal("450.00"));
        b2.put(3L, new BigDecimal("-450.00"));
        b2.put(4L, BigDecimal.ZERO);
        g2.setNetBalances(b2);
        groups.put(2L, g2);
    }

    public List<GroupResponseDTO> findAll() {
        return new ArrayList<>(groups.values());
    }

    public Optional<GroupResponseDTO> findById(Long id) {
        return Optional.ofNullable(groups.get(id));
    }

    public GroupResponseDTO save(GroupResponseDTO group) {
        if (group.getId() == null) {
            group.setId(idGenerator.incrementAndGet());
        }
        groups.put(group.getId(), group);
        return group;
    }
}
