package com.expensesync.core.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class GroupResponseDTO {
    private Long id;
    private String name;
    private String type;
    private Long createdBy;
    private String creatorName;
    private List<MemberDTO> members;
    private Map<Long, BigDecimal> netBalances;
    private List<DebtSimplificationDTO> simplifiedDebts;

    public static class MemberDTO {
        private Long id;
        private String name;
        private String email;

        public MemberDTO() {}
        public MemberDTO(Long id, String name, String email) {
            this.id = id;
            this.name = name;
            this.email = email;
        }
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    public GroupResponseDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }

    public String getCreatorName() { return creatorName; }
    public void setCreatorName(String creatorName) { this.creatorName = creatorName; }

    public List<MemberDTO> getMembers() { return members; }
    public void setMembers(List<MemberDTO> members) { this.members = members; }

    public Map<Long, BigDecimal> getNetBalances() { return netBalances; }
    public void setNetBalances(Map<Long, BigDecimal> netBalances) { this.netBalances = netBalances; }

    public List<DebtSimplificationDTO> getSimplifiedDebts() { return simplifiedDebts; }
    public void setSimplifiedDebts(List<DebtSimplificationDTO> simplifiedDebts) { this.simplifiedDebts = simplifiedDebts; }
}

