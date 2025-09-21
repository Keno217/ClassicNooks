import { render, screen, act } from '@testing-library/react';
import BookRail from '@/components/BookRail';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockBooks = [
  {
    id: 1,
    title: 'Moby Dick; Or, The Whale',
    cover: 'https://www.gutenberg.org/cache/epub/2701/pg2701.cover.medium.jpg',
    authors: [{ name: 'Melville, Herman', birth_year: 1819 }],
    book: 'https://www.gutenberg.org/ebooks/2701.txt.utf-8',
    description: `"Moby Dick; Or, The Whale" by Herman Melville is a novel written in the mid-19th century...`,
    genres: [
      'Adventure stories',
      'Ahab, Captain (Fictitious character) -- Fiction',
      'Mentally ill -- Fiction',
    ],
  },
  {
    id: 2,
    title: 'Frankenstein; Or, The Modern Prometheus',
    cover: 'https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg',
    authors: [{ name: 'Shelley, Mary Wollstonecraft', birth_year: 1797 }],
    book: 'https://www.gutenberg.org/ebooks/84.txt.utf-8',
    description: `"Frankenstein; Or, The Modern Prometheus" by Mary Wollstonecraft Shelley is a novel written in the early 19th century...`,
    genres: [
      "Frankenstein's monster (Fictitious character) -- Fiction",
      'Frankenstein, Victor (Fictitious character) -- Fiction',
    ],
  },
];

// Util for rendering a component w/ React Query
const renderWithQueryClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
};

describe('BookRail', () => {
  test('renders the section title', () => {
    renderWithQueryClient(<BookRail title='Featured Books' url='/api/books' />);

    const heading = screen.getByRole('heading', {
      level: 2,
      name: /featured books/i,
    });

    expect(heading).toBeInTheDocument();
  });

  test('renders BookCard components', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            results: mockBooks,
            next: null,
            page: 1,
            totalPages: 1,
            books: 2,
          }),
      } as Response)
    );

    renderWithQueryClient(<BookRail title='Featured Books' url='/api/books' />);

    for (const book of mockBooks) {
      const title = await screen.findByRole('heading', {
        level: 3,
        name: book.title,
      });
      
      expect(title).toBeInTheDocument();
    }

    (global.fetch as jest.Mock).mockRestore();
  });

  test('renders scroll buttons and triggers scroll', async () => {
    const manyBooks = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      title: `Book ${i + 1}`,
      cover: `/covers/book${i + 1}.jpg`,
      authors: [{ name: `Author ${i + 1}`, birth_year: 1900 + i }],
      book: 'https://www.gutenberg.org/ebooks/2701.txt.utf-8',
      description: 'Unknown',
      genres: ['Unknown'],
    }));

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            results: manyBooks,
            next: null,
            page: 1,
            totalPages: 1,
            books: manyBooks.length,
          }),
      } as Response)
    );

    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
      configurable: true,
      value: 1000,
    });

    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      value: 400,
    });

    renderWithQueryClient(<BookRail title='Scroll Test' url='/api/books' />);

    // Wait for books to render
    const lastBook = await screen.findByRole('heading', {
      level: 3,
      name: 'Book 10',
    });

    expect(lastBook).toBeInTheDocument();

    const container = screen.getByTestId('book-rail-container') as HTMLElement;
    container.scrollBy = jest.fn();

    /// Upon inital render, left arrow should be hidden
    expect(screen.queryByLabelText('Scroll left')).not.toBeInTheDocument();

    const rightButton = await screen.findByLabelText('Scroll right');
    expect(rightButton).toBeInTheDocument();

    // Simulate scrolling to the right
    Object.defineProperty(container, 'scrollLeft', {
      value: 100,
      writable: true,
    });

    await act(async () => {
      container.dispatchEvent(new Event('scroll'));
    });

    const leftButton = await screen.findByLabelText('Scroll left');
    expect(leftButton).toBeInTheDocument();

    // Simulate clicking the arrows
    await act(async () => {
      rightButton.click();
    });

    expect(container.scrollBy).toHaveBeenCalledWith({
      left: 400,
      behavior: 'smooth',
    });

    await act(async () => {
      leftButton.click();
    });

    expect(container.scrollBy).toHaveBeenCalledWith({
      left: -400,
      behavior: 'smooth',
    });

    (global.fetch as jest.Mock).mockRestore();
  });
});
