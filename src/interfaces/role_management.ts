import { AccountType } from "./user_interface";

export interface Role {
  id: string;
  org_id: string;
  name: string;
  description: string;
  account_types?: AccountType[];
}