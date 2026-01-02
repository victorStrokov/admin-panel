export type UserRow = {
  id: number;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
  devices: number;
  banned: boolean;
  provider?: string | null;
};
