import { navigationItems, pageHeaderOverrides, superAdminNavigationItems } from "@/data/navigationItems";
import { useLocation } from "react-router-dom";

export interface BreadcrumbItem {
  sectionLabel?: string; // Optional section label for grouping
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

const buildPageHeader = (
  pathname: string,
  navItems: typeof navigationItems
): PageHeaderMeta => {

  const segments = pathname.split("/").filter(Boolean);

  const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  let matchedSection: typeof navItems[0] | undefined;
  let parentItem: typeof navItems[0]["items"][0] | undefined;

  for (const section of navItems) {
    for (const item of section.items) {
      if (pathname.startsWith(item.url)) {
        matchedSection = section;
        parentItem = item;
        break;
      }
    }
    if (parentItem) break;
  }

  const sectionLabel = matchedSection?.title || "Home";
  const parentLabel = parentItem?.title || "Page";
  const parentUrl = parentItem?.url || "/";
  const parentIcon = parentItem?.icon;

  const rawLastSegment = segments[segments.length - 1];

  let currentLabel: string | undefined;

  if (
    rawLastSegment &&
    (UUID_REGEX.test(rawLastSegment) ||
      (parentItem && pathname !== parentItem.url))
  ) {
    currentLabel = UUID_REGEX.test(rawLastSegment)
      ? "View"
      : rawLastSegment;
  }

  const formatLabel = (segment: string) =>
    segment.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  return {
    title: currentLabel ? formatLabel(currentLabel) : parentLabel,
    icon: parentIcon,
    breadcrumb: {
      parent: {
        sectionLabel,
        label: parentLabel,
        url: parentUrl,
        icon: parentIcon,
      },
      current: currentLabel
        ? { label: formatLabel(currentLabel), url: pathname }
        : undefined,
    },
  };
};


export const usePageHeader = (): PageHeaderMeta => {

  const { pathname } = useLocation();

  for (const override of pageHeaderOverrides) {
    if (override.match(pathname)) return override.meta;
  }

  return buildPageHeader(pathname, navigationItems);
};

export const useSuperAdminPageHeader = (): PageHeaderMeta => {

  const { pathname } = useLocation();

  return buildPageHeader(pathname, superAdminNavigationItems);
};
