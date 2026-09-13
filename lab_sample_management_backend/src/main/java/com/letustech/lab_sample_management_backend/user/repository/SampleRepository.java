package com.letustech.lab_sample_management_backend.user.repository;

import com.letustech.lab_sample_management_backend.user.entity.Sample;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SampleRepository extends JpaRepository<Sample, Long> {

    List<Sample> findByUserId(Long userId);

    Optional<Sample> findByIdAndUserId(
            Long id,
            Long userId
    );
}