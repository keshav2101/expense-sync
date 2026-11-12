package com.expensesync.core.controller;

import com.expensesync.core.dto.GroupResponseDTO;
import com.expensesync.core.dto.SettlementRequestDTO;
import com.expensesync.core.entity.User;
import com.expensesync.core.service.GroupService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settlements")
public class SettleController {

    private final GroupService groupService;

    public SettleController(GroupService groupService) {
        this.groupService = groupService;
    }

    @PostMapping
    public ResponseEntity<GroupResponseDTO> recordSettlement(
            @AuthenticationPrincipal User user,
            @RequestBody SettlementRequestDTO settlement) {
        GroupResponseDTO updatedGroup = groupService.recordSettlement(settlement, user);
        return ResponseEntity.ok(updatedGroup);
    }
}
