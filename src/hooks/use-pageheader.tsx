import { navigationItems, pageHeaderOverrides } from "@/data/navigationItems";
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

export const usePageHeader = (): PageHeaderMeta => {
  const { pathname } = useLocation();

  for (const override of pageHeaderOverrides) {
    if (override.match(pathname)) return override.meta;
  }

  const segments = pathname.split("/").filter(Boolean);
  const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  let matchedSection: typeof navigationItems[0] | undefined;
  let parentItem: typeof navigationItems[0]["items"][0] | undefined;

  for (const section of navigationItems) {
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

  // Last segment of the URL
  const rawLastSegment = segments[segments.length - 1];

  let currentLabel: string | undefined;

  // Only add current if last segment is a UUID or different from parent URL
  if (
    rawLastSegment &&
    (UUID_REGEX.test(rawLastSegment) ||
      (parentItem && pathname !== parentItem.url))
  ) {
    currentLabel = UUID_REGEX.test(rawLastSegment) ? "View" : rawLastSegment;
  }

  const formatLabel = (segment: string) =>
    segment.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  const breadcrumb = {
    parent: {
      sectionLabel, // Section: Spaces & Sites
      label: parentLabel, // Item: Spaces
      url: parentUrl,
      icon: parentIcon,
    },
    current: currentLabel
      ? { label: formatLabel(currentLabel), url: pathname, icon: undefined }
      : undefined,
  };

  return {
    title: currentLabel ? formatLabel(currentLabel) : parentLabel,
    icon: parentIcon,
    breadcrumb,
  };
};