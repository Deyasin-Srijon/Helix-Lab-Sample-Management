package com.letustech.lab_sample_management_admin_backend.user.repository;

import com.letustech.lab_sample_management_admin_backend.user.entity.Sample;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for accessing sample records in MySQL.
 *
 * JpaRepository already provides:
 * - findAll()
 * - findById()
 * - save()
 * - delete()
 *
 * We are adding two custom search methods for the admin.
 */
@Repository
public interface SampleRepository
        extends JpaRepository<Sample, Long> {

    /**
     * Find samples by their status.
     *
     * Example:
     * findByStatusIgnoreCase("Completed")
     *
     * The IgnoreCase part makes the search case-insensitive.
     */
    List<Sample> findByStatusIgnoreCase(String status);

    /**
     * Find samples created by a particular user.
     *
     * Sample has a User relationship.
     * User has an id field.
     *
     * The underscore tells Spring Data JPA to navigate
     * through the User relationship and search using its id.
     */
    List<Sample> findByUser_Id(Long userId);

}
