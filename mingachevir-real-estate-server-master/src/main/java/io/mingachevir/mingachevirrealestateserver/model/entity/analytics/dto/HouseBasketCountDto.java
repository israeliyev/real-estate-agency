package io.mingachevir.mingachevirrealestateserver.model.entity.analytics.dto;

public class HouseBasketCountDto {
    private Long houseId;
    private String houseName;
    private Long basketCount;

    public HouseBasketCountDto(Long houseId, String houseName, Long basketCount) {
        this.houseId = houseId;
        this.houseName = houseName;
        this.basketCount = basketCount;
    }

}
