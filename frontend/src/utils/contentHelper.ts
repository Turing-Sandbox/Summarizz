import { Content } from "../models/Content";

// Normalizes date fields into proper Date objects
export function normalizeContentDates(content: Content): Content {
  if (
    content.dateCreated &&
    typeof content.dateCreated === "object" &&
    "seconds" in content.dateCreated
  ) {
    content.dateCreated = new Date(
      (content.dateCreated as { seconds: number }).seconds * 1000
    );
  }

  return content;
}
