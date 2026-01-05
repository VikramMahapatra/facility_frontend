import { navigationItems } from "@/data/navigationItems";
import { useLocation } from "react-router-dom";

export interface PageHeaderMeta {
  title: string;
  icon?: React.ElementType;
}

export const usePageHeader = (): PageHeaderMeta => {
  const { pathname } = useLocation();

  for (const section of navigationItems) {
    for (const item of section.items) {
      if (
        item.url === pathname ||
        pathname.startsWith(item.url + "/")
      ) {
        return {
          title: item.title,
          icon: item.icon,
        };
      }
    }
  }

  return {
    title: "Page",
  };
};
