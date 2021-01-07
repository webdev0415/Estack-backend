/** input for create subscription service */
export interface CreateSubscriptionDto {
  merchantId: string;
  paidCount: number;
  quantityOfPos: number;
}
