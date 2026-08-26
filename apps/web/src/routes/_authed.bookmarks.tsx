import { createFileRoute } from "@tanstack/react-router";
import { BookmarksPage } from "@/components/bookmarks-page";

export const Route = createFileRoute("/_authed/bookmarks")({
  component: BookmarksPage,
});
