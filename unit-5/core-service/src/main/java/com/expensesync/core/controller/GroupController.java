package com.expensesync.core.controller;

import com.expensesync.core.dto.DebtSimplificationDTO;
import com.expensesync.core.dto.GroupRequestDTO;
import com.expensesync.core.dto.GroupResponseDTO;
import com.expensesync.core.entity.User;
import com.expensesync.core.service.GroupService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    private final GroupService groupService;

    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    @GetMapping
    public ResponseEntity<List<GroupResponseDTO>> getAllGroups() {
        return ResponseEntity.ok(groupService.getAllGroups());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GroupResponseDTO> getGroupById(@PathVariable Long id) {
        return ResponseEntity.ok(groupService.getGroupById(id));
    }

    @PostMapping
    public ResponseEntity<GroupResponseDTO> createGroup(
            @AuthenticationPrincipal User user,
            @RequestBody GroupRequestDTO request) {
        GroupResponseDTO created = groupService.createGroup(request, user);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{id}/simplified-debts")
    public ResponseEntity<List<DebtSimplificationDTO>> getSimplifiedDebts(@PathVariable Long id) {
        GroupResponseDTO group = groupService.getGroupById(id);
        return ResponseEntity.ok(group.getSimplifiedDebts());
    }

    @GetMapping("/{id}/balances")
    public ResponseEntity<Map<Long, BigDecimal>> getBalances(@PathVariable Long id) {
        GroupResponseDTO group = groupService.getGroupById(id);
        return ResponseEntity.ok(group.getNetBalances());
    }
}

