package io.mingachevir.mingachevirrealestateserver.repository;

import io.mingachevir.mingachevirrealestateserver.model.entity.House;
import io.mingachevir.mingachevirrealestateserver.model.entity.HouseImage;
import io.mingachevir.mingachevirrealestateserver.model.entity.HouseRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;


public interface HouseImageJpaRepository extends JpaRepository<HouseImage, Long> {
    @Transactional
    @Modifying
    @Query("DELETE FROM HouseImage hi WHERE hi.house = :house")
    void deleteByHouse(@Param("house") House house);

    @Transactional
    @Modifying
    @Query("DELETE FROM HouseImage hi WHERE hi.houseRequest = :houseRequest")
    void deleteByHouseRequest(@Param("house") HouseRequest houseRequest);
}
