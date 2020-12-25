export interface GetDashboardDto {
  totalTransactions: TotalTransactions;
  visits: Visits;
  members: Members;
  grossValue: GrossValue;
}

interface TotalTransactions {
  totalAmount: number;
  transactionsToday: number;
}

interface Visits {
  totalVisits: number;
  todayVisits: number;
}

interface Members {
  totalMembers: number;
}

interface GrossValue {
  totalAmount: number;
}
