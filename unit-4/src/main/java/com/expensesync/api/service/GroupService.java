package com.expensesync.api.service;

import com.expensesync.api.exception.ResourceNotFoundException;
import com.expensesync.api.model.dto.DebtSimplificationDTO;
import com.expensesync.api.model.dto.GroupRequestDTO;
import com.expensesync.api.model.dto.GroupResponseDTO;
import com.expensesync.api.model.dto.SettlementRequestDTO;
import com.expensesync.api.repository.InMemoryGroupRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class GroupService {

    private final InMemoryGroupRepository groupRepository;
    private final DebtSimplificationService debtSimplificationService;
    private final AtomicLong memberIdSeq = new AtomicLong(100);

    public GroupService(InMemoryGroupRepository groupRepository,
                        DebtSimplificationService debtSimplificationService) {
        this.groupRepository = groupRepository;
        this.debtSimplificationService = debtSimplificationService;
    }

    public List<GroupResponseDTO> getAllGroups() {
        List<GroupResponseDTO> list = groupRepository.findAll();
        for (GroupResponseDTO g : list) {
            refreshSimplifiedDebts(g);
        }
        return list;
    }

    public GroupResponseDTO getGroupById(Long id) {
        GroupResponseDTO g = groupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Group with ID " + id + " not found"));
        refreshSimplifiedDebts(g);
        return g;
    }

    public GroupResponseDTO createGroup(GroupRequestDTO request) {
        GroupResponseDTO group = new GroupResponseDTO();
        group.setName(request.getName());
        group.setType(request.getType());
        group.setCreatedBy(request.getCreatedBy());
        group.setCreatorName("User #" + request.getCreatedBy());

        List<GroupResponseDTO.MemberDTO> members = new ArrayList<>();
        // Add creator
        members.add(new GroupResponseDTO.MemberDTO(request.getCreatedBy(), "User #" + request.getCreatedBy(), "creator@example.com"));

        // Add additional members
        Map<Long, BigDecimal> balances = new HashMap<>();
        balances.put(request.getCreatedBy(), BigDecimal.ZERO);

        for (String email : request.getMemberEmails()) {
            Long mid = memberIdSeq.incrementAndGet();
            String name = email.split("@")[0];
            members.add(new GroupResponseDTO.MemberDTO(mid, name, email));
            balances.put(mid, BigDecimal.ZERO);
        }

        group.setMembers(members);
        group.setNetBalances(balances);
        refreshSimplifiedDebts(group);

        return groupRepository.save(group);
    }

    public GroupResponseDTO recordSettlement(SettlementRequestDTO settlement) {
        GroupResponseDTO group = getGroupById(settlement.getGroupId());
        Map<Long, BigDecimal> balances = group.getNetBalances();

        BigDecimal payerBal = balances.getOrDefault(settlement.getPayerId(), BigDecimal.ZERO);
        BigDecimal payeeBal = balances.getOrDefault(settlement.getPayeeId(), BigDecimal.ZERO);

        // Payer paid -> balance increases (less debt)
        balances.put(settlement.getPayerId(), payerBal.add(settlement.getAmount()));
        // Payee received -> balance decreases
        balances.put(settlement.getPayeeId(), payeeBal.subtract(settlement.getAmount()));

        group.setNetBalances(balances);
        refreshSimplifiedDebts(group);
        return groupRepository.save(group);
    }

    private void refreshSimplifiedDebts(GroupResponseDTO group) {
        Map<Long, String> userNames = new HashMap<>();
        if (group.getMembers() != null) {
            for (GroupResponseDTO.MemberDTO m : group.getMembers()) {
                userNames.put(m.getId(), m.getName());
            }
        }
        List<DebtSimplificationDTO> simplified = debtSimplificationService.simplifyDebts(group.getNetBalances(), userNames);
        group.setSimplifiedDebts(simplified);
    }
}

