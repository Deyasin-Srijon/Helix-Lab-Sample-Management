package com.letustech.lab_sample_management_backend.user.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "samples")
public class Sample {

    @Id
    private Long id;

    @Column
    private String description;

    @Column
    private String status;

    @Column(nullable = false)
    private LocalDate createdDate;

    @Column(nullable = false)
    private LocalTime createdTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public Sample() {
    }

    public Sample(
            Long id,
            String description,
            String status,
            User user
    ) {
        this.id = id;
        this.description = description;
        this.status = status;
        this.user = user;
    }

    public Sample(
            Long id,
            String description,
            String status,
            LocalDate createdDate,
            LocalTime createdTime,
            User user
    ) {
        this.id = id;
        this.description = description;
        this.status = status;
        this.createdDate = createdDate;
        this.createdTime = createdTime;
        this.user = user;
    }

    @PrePersist
    protected void onCreate() {

        if (createdDate == null) {
            createdDate = LocalDate.now();
        }

        if (createdTime == null) {
            createdTime = LocalTime.now();
        }
    }

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getCreatedDate() {
        return createdDate;
    }
    public void setCreatedDate(LocalDate createdDate) {
        this.createdDate = createdDate;
    }

    public LocalTime getCreatedTime() {
        return createdTime;
    }
    public void setCreatedTime(LocalTime createdTime) {
        this.createdTime = createdTime;
    }

    public User getUser() {
        return user;
    }
    public void setUser(User user) {
        this.user = user;
    }
}