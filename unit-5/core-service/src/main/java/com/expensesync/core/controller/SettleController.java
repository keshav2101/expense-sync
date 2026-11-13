package com.expensesync.core.controller;

import com.expensesync.core.dto.GroupResponseDTO;
import com.expensesync.core.dto.SettlementRequestDTO;
import com.expensesync.core.entity.Settlement;
import com.expensesync.core.entity.User;
import com.expensesync.core.repository.SettlementRepository;
import com.expensesync.core.service.GroupService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/settlements")
public class SettleController {

    private final GroupService groupService;
    private final SettlementRepository settlementRepository;

    public SettleController(GroupService groupService, SettlementRepository settlementRepository) {
        this.groupService = groupService;
        this.settlementRepository = settlementRepository;
    }

    @PostMapping
    public ResponseEntity<GroupResponseDTO> recordSettlement(
            @AuthenticationPrincipal User user,
            @RequestBody SettlementRequestDTO settlement) {
        GroupResponseDTO updatedGroup = groupService.recordSettlement(settlement, user);
        return ResponseEntity.ok(updatedGroup);
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getSettlements(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) Long groupId) {
        List<Settlement> settlements;
        if (groupId != null) {
            settlements = settlementRepository.findByGroupIdOrderBySettledAtDesc(groupId);
        } else if (user != null) {
            settlements = settlementRepository.findByPayerIdOrPayeeIdOrderBySettledAtDesc(user.getId(), user.getId());
        } else {
            settlements = settlementRepository.findAll();
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Settlement s : settlements) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", s.getId());
            map.put("payer", s.getPayer().getName());
            map.put("payerId", s.getPayer().getId());
            map.put("payee", s.getPayee().getName());
            map.put("payeeId", s.getPayee().getId());
            map.put("amount", s.getAmount());
            map.put("method", s.getPaymentMethod());
            map.put("date", s.getSettledAt() != null ? s.getSettledAt().toString().substring(0, 10) : "");
            map.put("group", s.getGroup() != null ? s.getGroup().getName() : "General");
            map.put("groupId", s.getGroup() != null ? s.getGroup().getId() : null);
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }
}
