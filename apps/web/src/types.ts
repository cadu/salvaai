export type Bookmark = {
  id: string;
  title: string;
  url: string;
  description: string | null;
  tags: string[];
  createdAt: string;
};

export type BookmarkInput = {
  title: string;
  url: string;
  description: string | null;
  tags: string[];
};

export type Usuario = {
  name: string;
  email: string;
};
