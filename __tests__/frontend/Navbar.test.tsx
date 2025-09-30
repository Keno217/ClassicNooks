import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from '@/components/Navbar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter, usePathname } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, fill, ...rest }: any) => (
    <img src={src} alt={alt} {...rest} />
  ),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

global.fetch = jest.fn();

const mockPush = jest.fn();
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

const renderWithQueryClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const result = render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );

  return {
    ...result,
    rerender: (newUi: React.ReactElement) =>
      result.rerender(
        <QueryClientProvider client={queryClient}>{newUi}</QueryClientProvider>
      ),
  };
};

const mockBooks = [
  {
    id: 1,
    title: 'Test Book 1',
    cover: '/test-cover-1.jpg',
    authors: [{ name: 'Author 1' }, { name: 'Author 2' }],
  },
  {
    id: 2,
    title: 'Test Book 2',
    cover: '/test-cover-2.jpg',
    authors: [{ name: 'Author 3' }],
  },
];

beforeEach(() => {
  mockUseRouter.mockReturnValue({
    push: mockPush,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  } as any);

  mockUsePathname.mockReturnValue('/');
  (global.fetch as jest.Mock).mockClear();
  mockPush.mockClear();
  document.body.style.overflow = 'auto';
});

describe('Navbar', () => {
  test('renders app name and navigation elements', () => {
    renderWithQueryClient(<Navbar />);

    const heading = screen.getByRole('heading', {
      name: /📚 BookWorm/i,
      level: 2,
    });

    expect(heading).toBeInTheDocument();
    expect(screen.getAllByText('Home')).toHaveLength(2);
    expect(screen.getAllByText('Library')).toHaveLength(2);
    expect(screen.getByPlaceholderText('Search books...')).toBeInTheDocument();
  });

  test('toggles mobile navigation', async () => {
    renderWithQueryClient(<Navbar />);

    const mobileToggle = screen.getAllByRole('button')[0];
    expect(mobileToggle).toBeInTheDocument();

    fireEvent.click(mobileToggle);

    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.click(mobileToggle);

    expect(document.body.style.overflow).toBe('auto');
  });

  test('handles search input changes', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<Navbar />);

    const searchInput = screen.getByPlaceholderText('Search books...');

    await user.type(searchInput, 'test search');

    expect(searchInput).toHaveValue('test search');
  });

  test('submits search form and navigates to search page', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<Navbar />);

    const searchInput = screen.getByPlaceholderText('Search books...');
    const searchForm = searchInput.closest('form')!;

    await user.type(searchInput, 'test book');
    fireEvent.submit(searchForm);

    expect(mockPush).toHaveBeenCalledWith('/search?query=test%20book');
  });

  test('does not navigate when search is empty', async () => {
    renderWithQueryClient(<Navbar />);

    const searchInput = screen.getByPlaceholderText('Search books...');
    const searchForm = searchInput.closest('form')!;
    fireEvent.submit(searchForm);

    expect(mockPush).not.toHaveBeenCalled();
  });

  test('fetches and displays search results', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: mockBooks }),
    });

    const user = userEvent.setup();
    renderWithQueryClient(<Navbar />);

    const searchInput = screen.getByPlaceholderText('Search books...');
    await user.type(searchInput, 'test');

    await waitFor(() => {
      // FIXME: Change domain when pushed to prod
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/books?search=test&limit=5'
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Test Book 1')).toBeInTheDocument();
      expect(screen.getByText('Test Book 2')).toBeInTheDocument();
      expect(screen.getByText('Author 1, Author 2')).toBeInTheDocument();
      expect(screen.getByText('Author 3')).toBeInTheDocument();
    });
  });

  test('closes mobile nav on pathname change', () => {
    const { rerender } = renderWithQueryClient(<Navbar />);

    const mobileToggle = screen.getAllByRole('button')[0];
    fireEvent.click(mobileToggle);

    expect(document.body.style.overflow).toBe('hidden');

    mockUsePathname.mockReturnValue('/new-page');

    rerender(<Navbar />);

    expect(document.body.style.overflow).toBe('auto');
  });

  test('search results contain proper links to book pages', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: mockBooks }),
    });

    const user = userEvent.setup();
    renderWithQueryClient(<Navbar />);

    const searchInput = screen.getByPlaceholderText('Search books...');
    await user.type(searchInput, 'test');

    await waitFor(() => {
      const bookLinks = screen.getAllByRole('link');
      const bookLink1 = bookLinks.find(
        (link) => link.getAttribute('href') === '/books/1'
      );

      const bookLink2 = bookLinks.find(
        (link) => link.getAttribute('href') === '/books/2'
      );

      expect(bookLink1).toBeInTheDocument();
      expect(bookLink2).toBeInTheDocument();
    });
  });

  test('mobile search form works correctly', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<Navbar />);

    const mobileToggle = screen.getAllByRole('button')[0];
    fireEvent.click(mobileToggle);

    const mobileSearchInput = screen.getByPlaceholderText('Title or author...');
    const mobileSearchButton = screen.getByText('Search Library');

    await user.type(mobileSearchInput, 'mobile test');
    fireEvent.click(mobileSearchButton);

    expect(mockPush).toHaveBeenCalledWith('/search?query=mobile%20test');
  });
});
