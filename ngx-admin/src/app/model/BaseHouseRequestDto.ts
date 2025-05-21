export interface BaseHouseRequestDto {
  id: number;
  requester: string;
  price: number;
  priceType: string;
  location: string;
  number: string;
  createDate: Date;
  coverImage: string;
}
