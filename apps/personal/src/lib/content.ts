import { cache } from "react";
import { getGeneralSettings, getPersonalContent } from "@repo/db";

/** One query set per request, shared by the nav, footer and page. */
export const getContent = cache(getPersonalContent);

/** Music and favicons, shared by the layout and metadata. */
export const getSettings = cache(getGeneralSettings);
