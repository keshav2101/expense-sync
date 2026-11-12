package com.expensesync.api.controller;

import com.expensesync.api.model.dto.GroupResponseDTO;
import com.expensesync.api.model.dto.SettlementRequestDTO;
import com.expensesync.api.service.GroupService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settlements")
@CrossOrigin(origins = "*")
public class SettleController {

    private final GroupService groupService;

    public SettleController(GroupService groupService) {
        this.groupService = groupService;
    }

    @PostMapping
    public ResponseEntity<GroupResponseDTO> recordSettlement(@Valid @RequestBody SettlementRequestDTO settlement) {
        GroupResponseDTO updatedGroup = groupService.recordSettlement(settlement);
        return ResponseEntity.ok(updatedGroup);
    }
}
