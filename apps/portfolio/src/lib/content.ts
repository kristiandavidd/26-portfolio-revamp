import { cache } from "react";
import { getGeneralSettings, getSiteContent } from "@repo/db";

/** One query set per request, shared by the layout, metadata and the page. */
export const getContent = cache(getSiteContent);

/** Music and favicons, shared by the layout and metadata. */
export const getSettings = cache(getGeneralSettings);
