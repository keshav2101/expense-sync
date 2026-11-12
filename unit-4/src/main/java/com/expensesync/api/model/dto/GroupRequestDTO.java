package com.expensesync.api.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class GroupRequestDTO {
    @NotBlank(message = "Group name is required")
    private String name;

    private String type = "TRIP"; // TRIP, HOME, COUPLE, OTHER

    @NotNull(message = "Creator user ID is required")
    private Long createdBy;

    @NotEmpty(message = "At least one member email must be provided")
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
