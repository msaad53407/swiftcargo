export type Policy = {
  id: string;
  title: string;
  content: string;
  type: "employee" | "customer";
  createdAt: Date;
  lastUpdated: Date;
  isActive: boolean;
};
