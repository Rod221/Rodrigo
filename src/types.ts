export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  msgSent: boolean;
  msgConfirmed: boolean;
  msgReplied: boolean;
  registeredAt: string; // YYYY-MM-DD
}

export interface DashboardMetrics {
  totalClients: number;
  totalSent: number;
  totalConfirmed: number;
  totalReplied: number;
  confirmationRate: number;
  replyRate: number;
}
