package com.letustech.lab_sample_management_admin_backend.user.repository;

import com.letustech.lab_sample_management_admin_backend.user.entity.Sample;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SampleRepository extends JpaRepository<Sample, Long> {
    // JpaRepository already provides findAll(), findById(), save(), and delete().
}
