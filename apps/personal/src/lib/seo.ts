/**
 * The personal site is a sibling of the portfolio, not a competitor: it points
 * at the same person entity and sends readers to the canonical work site.
 */
export const PERSONAL_URL = (
  process.env.NEXT_PUBLIC_PERSONAL_URL || "https://personal.kristiandav.id"
).replace(/\/$/, "");

export const PORTFOLIO_URL = (
  process.env.NEXT_PUBLIC_PORTFOLIO_URL || "https://kristiandav.id"
).replace(/\/$/, "");

export const PERSON_ID = `${PORTFOLIO_URL}/#person`;
