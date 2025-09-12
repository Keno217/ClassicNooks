import { render, screen } from '@testing-library/react';
import BookCard from '@/components/BookCard';

describe('BookCard', () => {
  const bookProps = {
    id: 42,
    title: '1984',
    author: 'George Orwell',
    cover: '/covers/1984.jpg',
  };

  beforeEach(() => {
    render(<BookCard {...bookProps} />);
  });

  test('renders the book title', () => {
    const heading = screen.getByRole('heading', { name: /1984/i, level: 3 });
    expect(heading).toBeInTheDocument();
  });

  test('renders the book author', () => {
    const author = screen.getByText(bookProps.author);
    expect(author).toBeInTheDocument();
  });

  test('renders the cover image, with correct src and alt', () => {
    const img = screen.getByAltText(
      `Cover of ${bookProps.title} by ${bookProps.author}`
    );
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', bookProps.cover);
  });

  test('renders a link to the correct book page', () => {
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', `/books/${bookProps.id}`);
  });
});
