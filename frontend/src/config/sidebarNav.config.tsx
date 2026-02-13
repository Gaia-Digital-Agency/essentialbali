import {
  BriefcaseBusiness,
  Cog,
  ImagePlus,
  LayoutGrid,
  Rss,
  UserCog,
} from "lucide-react";
import { TableIcon } from "../icons";
import { UserLevelProps } from "../types/auth.type";

export type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  allowedUserLevel?: Array<UserLevelProps>;
  subItems?: {
    name: string;
    path: string;
    pro?: boolean;
    new?: boolean;
    allowedUserLevel?: Array<UserLevelProps>;
  }[];
};

export const navItems: NavItem[] = [
  {
    icon: <LayoutGrid />,
    name: "Master",
    subItems: [
      { name: "Bali Areas", path: "mst_locations", pro: false },
      { name: "Categories", path: "mst_categories", pro: false, allowedUserLevel: ["super_admin"] },
      { name: "Tags", path: "mst_tags", pro: false, allowedUserLevel: ["super_admin"] },
      { name: "Articles", path: "mst_article", pro: false },
    ],
  },
  {
    icon: <TableIcon />,
    name: "Templates",
    subItems: [
      { name: "Header Navigation", path: "/admin/mst_templates/general", pro: false, allowedUserLevel: ["super_admin"] },
      { name: "Area Pages", path: "/admin/mst_templates", pro: false },
      { name: "About", path: "/admin/mst_templates/about", pro: false, allowedUserLevel: ["super_admin"] },
    ],
  },
  {
    name: "Media",
    icon: <ImagePlus />,
    subItems: [
      { name: "Add Media", path: "add_media" },
      { name: "Media Library", path: "media_library" },
    ],
  },
  {
    name: "Newsletter Subscriber",
    icon: <Rss />,
    allowedUserLevel: ["super_admin"],
    subItems: [
      { name: "Subscriber List", path: "subscriber_list", allowedUserLevel: ["super_admin"] },
    ],
  },
  {
    name: "Job Applicant",
    icon: <BriefcaseBusiness />,
    path: "job_applicant",
  },
];

export const othersItems: NavItem[] = [
  {
    name: "User Management",
    icon: <UserCog />,
    subItems: [
      { name: "Users", path: "users", allowedUserLevel: ["super_admin"] },
      { name: "Add User", path: "registration", allowedUserLevel: ["super_admin"] },
      { name: "Profile", path: "profile" },
    ],
  },
  {
    name: "Setting",
    icon: <Cog />,
    allowedUserLevel: ["super_admin"],
    subItems: [
      { name: "Setting", path: "setting" },
      { name: "Social Media", path: "socmed" },
      { name: "SMTP Configuration", path: "configSMTP" },
    ],
  },
];
