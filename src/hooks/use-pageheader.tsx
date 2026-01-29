import { navigationItems, pageHeaderOverrides } from "@/data/navigationItems";
import { useLocation } from "react-router-dom";

export interface BreadcrumbItem {
  label: string;
  url?: string;
  icon?: React.ElementType;
}

export interface PageHeaderMeta {
  title: string;
  icon?: React.ElementType;
  breadcrumb?: {
    parent?: BreadcrumbItem;
    current: BreadcrumbItem;
  };
}


export const usePageHeader = (): PageHeaderMeta => {
  const { pathname } = useLocation();

  for (const override of pageHeaderOverrides) {
    if (override.match(pathname)) {
      return override.meta;
    }
  }

  for (const section of navigationItems) {
    for (const item of section.items) {
      if (
        item.url === pathname ||
        pathname.startsWith(item.url + "/")
      ) {
        return {
          title: item.title,
          icon: item.icon,
          breadcrumb: {
            parent: {
              label: section.title,
            },
            current: {
              label: item.title,
              url: item.url,
              icon: item.icon, // 👈 current icon
            },
          },
        };
      }
    }
  }

  return {
    title: "Page",
  };
};
