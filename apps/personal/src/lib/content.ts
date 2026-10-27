import { cache } from "react";
import { getPersonalContent } from "@repo/db";

/** One query set per request, shared by the nav, footer and page. */
export const getContent = cache(getPersonalContent);
