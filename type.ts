import type { ExtNode } from "relatives-tree/lib/types";
import { Icons } from "./components/icons";
import { Timestamp } from "firebase/firestore";

export interface NodeItem extends ExtNode {
  name?: string;
  birthday?: string;
  deathday?: string;
  note?: string;
  address?: string;
  birthPlace?: string;
  phoneNum?: string;
  email?: string;
  file?: File;
  isAlive?: boolean;
  childType?: string;
  otherParentId?: string;
  photoURL?: string;
  userId?: string;
  isRoot?: boolean;
  hasEditReq?: boolean;
  hasDeleteReq?: boolean;
  hasAddReq?: boolean;
  editUser?: string;
  deleteId?: string;
}

export interface NavItem {
  title: string;
  href?: string;
  disabled?: boolean;
  external?: boolean;
  icon?: keyof typeof Icons;
  label?: string;
  description?: string;
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[];
}

export interface NavItemWithOptionalChildren extends NavItem {
  items?: NavItemWithChildren[];
}

export interface FooterItem {
  title: string;
  items: {
    title: string;
    href: string;
    external?: boolean;
  }[];
}

export type MainNavItem = NavItemWithOptionalChildren;

export type SidebarNavItem = NavItemWithChildren;

export type User = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  verified?: boolean;
  lastLoginAt?: Timestamp;
  photoURL?: string;
};
