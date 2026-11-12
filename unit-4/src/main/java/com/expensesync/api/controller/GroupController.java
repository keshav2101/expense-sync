package com.expensesync.api.controller;

import com.expensesync.api.model.dto.DebtSimplificationDTO;
import com.expensesync.api.model.dto.GroupRequestDTO;
import com.expensesync.api.model.dto.GroupResponseDTO;
import com.expensesync.api.service.GroupService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "*")
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
    public ResponseEntity<GroupResponseDTO> createGroup(@Valid @RequestBody GroupRequestDTO request) {
        GroupResponseDTO created = groupService.createGroup(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{id}/simplified-debts")
    public ResponseEntity<List<DebtSimplificationDTO>> getSimplifiedDebts(@PathVariable Long id) {
        GroupResponseDTO group = groupService.getGroupById(id);
        return ResponseEntity.ok(group.getSimplifiedDebts());
    }
}
