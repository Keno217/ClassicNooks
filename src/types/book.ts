export interface Author {
  name: string;
}

export interface Book {
  id: number;
  title: string;
  cover: string;
  book: string;
  description: string;
  authors: Author[];
}
