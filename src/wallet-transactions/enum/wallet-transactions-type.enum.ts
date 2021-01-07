export enum WalletTransactionsTypeEnum {
  /** Pos sent point to customer */
  POINTS_EARNED = 'POINTS_EARNED',
  /** customer converted point to $ */
  POINTS_CONVERTED = 'POINTS_CONVERTED',
  /** coupon was created */
  COUPON_CREATED = 'COUPON_CREATED',
  /** pos accepted coupon */
  COUPON_ACCEPTED = 'COUPON_ACCEPTED',
  /** customer spent coupon */
  COUPON_DENIED = 'COUPON_DENIED',
}
