import { navigationItems } from "@/data/navigationItems";

export interface PageMeta {
  title: string;
  icon?: React.ElementType;
  resource?: string;
}

export const getPageMetaByPath = (pathname: string): PageMeta | null => {
  for (const section of navigationItems) {
    for (const item of section.items) {
      // exact match
      if (item.url === pathname) {
        return {
          title: item.title,
          icon: item.icon,
          resource: item.resource,
        };
      }

      // optional: handle nested routes like /sites/123
      if (pathname.startsWith(item.url + "/")) {
        return {
          title: item.title,
          icon: item.icon,
          resource: item.resource,
        };
      }
    }
  }
  return null;
};
