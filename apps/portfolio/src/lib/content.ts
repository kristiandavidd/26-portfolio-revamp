import { cache } from "react";
import { getSiteContent } from "@repo/db";

/** One query set per request, shared by the layout, metadata and the page. */
export const getContent = cache(getSiteContent);
