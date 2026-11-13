package com.expensesync.core.service;

import com.expensesync.core.dto.*;
import com.expensesync.core.entity.Expense;
import com.expensesync.core.entity.ExpenseSplit;
import com.expensesync.core.entity.Group;
import com.expensesync.core.entity.Settlement;
import com.expensesync.core.entity.User;
import com.expensesync.core.repository.ExpenseRepository;
import com.expensesync.core.repository.GroupRepository;
import com.expensesync.core.repository.SettlementRepository;
import com.expensesync.core.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
@Transactional
public class GroupService {

    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;
    private final SettlementRepository settlementRepository;
    private final DebtSimplificationService debtSimplificationService;
    private final PasswordEncoder passwordEncoder;

    public GroupService(GroupRepository groupRepository,
                        UserRepository userRepository,
                        ExpenseRepository expenseRepository,
                        SettlementRepository settlementRepository,
                        DebtSimplificationService debtSimplificationService,
                        PasswordEncoder passwordEncoder) {
        this.groupRepository = groupRepository;
        this.userRepository = userRepository;
        this.expenseRepository = expenseRepository;
        this.settlementRepository = settlementRepository;
        this.debtSimplificationService = debtSimplificationService;
        this.passwordEncoder = passwordEncoder;
    }

    public List<GroupResponseDTO> getAllGroups() {
        List<Group> groups = groupRepository.findAll();
        List<GroupResponseDTO> list = new ArrayList<>();
        for (Group g : groups) {
            list.add(enrichGroupDTO(g));
        }
        return list;
    }

    public List<GroupResponseDTO> getGroupsForUser(User user) {
        if (user == null) {
            return Collections.emptyList();
        }
        List<Group> groups = groupRepository.findGroupsByUserId(user.getId());
        List<GroupResponseDTO> list = new ArrayList<>();
        for (Group g : groups) {
            list.add(enrichGroupDTO(g));
        }
        return list;
    }

    public GroupResponseDTO getGroupById(Long id) {
        Group g = groupRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Group with ID " + id + " not found"));
        return enrichGroupDTO(g);
    }

    public GroupResponseDTO createGroup(GroupRequestDTO request, User currentUser) {
        User creator = currentUser != null ? currentUser :
                (request.getCreatedBy() != null ? userRepository.findById(request.getCreatedBy()).orElse(null) : null);

        if (creator == null) {
            creator = userRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new IllegalStateException("No user available to create group"));
        }

        Group group = new Group();
        group.setName(request.getName());
        group.setType(request.getType() != null ? request.getType() : "TRIP");
        group.setCreatedBy(creator);

        Set<User> members = new HashSet<>();
        members.add(creator);

        if (request.getMemberEmails() != null) {
            for (String email : request.getMemberEmails()) {
                String cleanEmail = email.trim();
                if (cleanEmail.isEmpty()) continue;
                User member = userRepository.findByEmail(cleanEmail)
                        .orElseGet(() -> {
                            String name = cleanEmail.contains("@") ? cleanEmail.split("@")[0] : cleanEmail;
                            return userRepository.save(new User(name, cleanEmail, passwordEncoder.encode("Password@123"), "INR"));
                        });
                members.add(member);
            }
        }

        group.setMembers(members);
        Group saved = groupRepository.save(group);
        return enrichGroupDTO(saved);
    }

    public GroupResponseDTO recordSettlement(SettlementRequestDTO dto, User currentUser) {
        Group group = groupRepository.findById(dto.getGroupId())
                .orElseThrow(() -> new IllegalArgumentException("Group with ID " + dto.getGroupId() + " not found"));

        User payer = userRepository.findById(dto.getPayerId())
                .orElseThrow(() -> new IllegalArgumentException("Payer with ID " + dto.getPayerId() + " not found"));
        User payee = userRepository.findById(dto.getPayeeId())
                .orElseThrow(() -> new IllegalArgumentException("Payee with ID " + dto.getPayeeId() + " not found"));

        Settlement settlement = new Settlement();
        settlement.setGroup(group);
        settlement.setPayer(payer);
        settlement.setPayee(payee);
        settlement.setAmount(dto.getAmount());
        settlement.setPaymentMethod(dto.getPaymentMethod() != null ? dto.getPaymentMethod() : "UPI");
        settlement.setNotes(dto.getNotes());
        settlementRepository.save(settlement);

        return enrichGroupDTO(group);
    }

    public List<Settlement> getSettlementsForGroup(Long groupId) {
        return settlementRepository.findByGroupIdOrderBySettledAtDesc(groupId);
    }

    private GroupResponseDTO enrichGroupDTO(Group group) {
        GroupResponseDTO dto = new GroupResponseDTO();
        dto.setId(group.getId());
        dto.setName(group.getName());
        dto.setType(group.getType());
        dto.setCreatedBy(group.getCreatedBy().getId());
        dto.setCreatorName(group.getCreatedBy().getName());

        List<GroupResponseDTO.MemberDTO> memberDTOs = new ArrayList<>();
        Map<Long, BigDecimal> netBalances = new HashMap<>();
        Map<Long, String> userNames = new HashMap<>();

        for (User u : group.getMembers()) {
            memberDTOs.add(new GroupResponseDTO.MemberDTO(u.getId(), u.getName(), u.getEmail()));
            netBalances.put(u.getId(), BigDecimal.ZERO);
            userNames.put(u.getId(), u.getName());
        }
        dto.setMembers(memberDTOs);

        // 1. Process Group Expenses and Splits
        List<Expense> expenses = expenseRepository.findByGroupIdOrderByExpenseDateDesc(group.getId());
        for (Expense exp : expenses) {
            Long payerId = exp.getPaidBy().getId();
            BigDecimal payerBal = netBalances.getOrDefault(payerId, BigDecimal.ZERO);
            netBalances.put(payerId, payerBal.add(exp.getAmount()));

            List<ExpenseSplit> splits = exp.getSplits();
            if (splits != null && !splits.isEmpty()) {
                for (ExpenseSplit split : splits) {
                    Long memberId = split.getUser().getId();
                    BigDecimal current = netBalances.getOrDefault(memberId, BigDecimal.ZERO);
                    netBalances.put(memberId, current.subtract(split.getShareAmount()));
                }
            } else {
                // Fallback equal split among all group members if splits not explicitly stored
                int count = group.getMembers().size();
                if (count > 0) {
                    BigDecimal share = exp.getAmount().divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP);
                    for (User m : group.getMembers()) {
                        BigDecimal current = netBalances.getOrDefault(m.getId(), BigDecimal.ZERO);
                        netBalances.put(m.getId(), current.subtract(share));
                    }
                }
            }
        }

        // 2. Process Settlements
        List<Settlement> settlements = settlementRepository.findByGroupIdOrderBySettledAtDesc(group.getId());
        for (Settlement s : settlements) {
            Long payerId = s.getPayer().getId();
            Long payeeId = s.getPayee().getId();

            BigDecimal payerBal = netBalances.getOrDefault(payerId, BigDecimal.ZERO);
            netBalances.put(payerId, payerBal.add(s.getAmount()));

            BigDecimal payeeBal = netBalances.getOrDefault(payeeId, BigDecimal.ZERO);
            netBalances.put(payeeId, payeeBal.subtract(s.getAmount()));
        }

        // Format balances to 2 decimals
        Map<Long, BigDecimal> formattedBalances = new LinkedHashMap<>();
        for (Map.Entry<Long, BigDecimal> entry : netBalances.entrySet()) {
            formattedBalances.put(entry.getKey(), entry.getValue().setScale(2, RoundingMode.HALF_UP));
        }
        dto.setNetBalances(formattedBalances);

        // 3. Calculate Debt Simplification
        List<DebtSimplificationDTO> simplified = debtSimplificationService.simplifyDebts(formattedBalances, userNames);
        dto.setSimplifiedDebts(simplified);

        return dto;
    }
}

