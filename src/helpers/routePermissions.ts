import { navigationItems } from "@/data/navigationItems";

export const resourceMap: Record<string, string> = {};

navigationItems.forEach(section => {
    section.items.forEach(item => {
        if (item.url && item.resource) {
            resourceMap[item.url] = item.resource;
        }
    });
});
