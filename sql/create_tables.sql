-- books table
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  cover TEXT,
  book TEXT,
  description TEXT
);

-- authors table
CREATE TABLE authors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  birth_year INT
);

-- book_authors join table (many-to-many)
CREATE TABLE book_authors (
  book_id INT REFERENCES books(id) ON DELETE CASCADE,
  author_id INT REFERENCES authors(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, author_id)
);

-- genres table
CREATE TABLE genres (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE
);

-- book_genres join table (many-to-many)
CREATE TABLE book_genres (
  book_id INT REFERENCES books(id) ON DELETE CASCADE,
  genre_id INT REFERENCES genres(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, genre_id)
);
