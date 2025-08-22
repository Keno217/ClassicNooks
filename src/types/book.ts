export interface Author {
  name: string;
  birth_year: number;
}

export interface Book {
  id: number;
  title: string;
  cover: string;
  book: string;
  description: string;
  genres: string[];
  authors: Author[];
}

export interface GetBookApiResponse {
  page: number;
  totalPages: number;
  books: number;
  next: string | null;
  results: Book[];
}
