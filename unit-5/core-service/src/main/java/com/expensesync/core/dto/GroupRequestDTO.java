package com.expensesync.core.dto;

import java.util.List;

public class GroupRequestDTO {
    private String name;
    private String type = "TRIP"; // TRIP, HOME, COUPLE, OTHER
    private Long createdBy;
    private List<String> memberEmails;

    public GroupRequestDTO() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }

    public List<String> getMemberEmails() { return memberEmails; }
    public void setMemberEmails(List<String> memberEmails) { this.memberEmails = memberEmails; }
}
