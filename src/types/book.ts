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

export interface GetBookApiResponse {
  page: number;
  totalPages: number;
  books: number;
  next: string | null;
  results: Book[];
}
