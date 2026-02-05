export type ActivityLogRow = {
  id: number;
  userId: number;
  action: string;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
};
