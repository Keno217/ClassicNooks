# Bookworm

## 1 Abstract

The purpose of this app is to provide users with a seamless e-book reading experience by accessing a vast library of free books from an API and database. Bookworm helps users discover, read, and customize their reading experience with adjustable settings and a responsive design, making reading enjoyable on any device.

## 2 Introduction

Have you ever wanted a simple way to access thousands of classic books online with customizable reading preferences? Bookworm is here to transform how you read e-books. Whether you’re a casual reader or a dedicated book lover, this app gives you access to over 70,000 books, allowing you to explore and read public domain books with ease. Tailor your reading settings to your comfort and enjoy a responsive layout that works beautifully on phones, tablets, and desktops.

## 3 Architectural Design

Bookworm is built using a client-serverless architecture. The frontend is a responsive web interface built with React and Tailwind CSS, allowing users to browse and explore a large catalog of books. Users can register an account and filter books by genre, view details like title, description, cover, and author, and scroll through paginated results.

The backend is handled by Next.js API routes, which query a PostgreSQL database through the pg library. The reason I chose the pg library is so that I can have the full functionality of SQL, without an ORM doing stuff under the hood for me. Book metadata is stored in a relational format, with proper relationships for authors and genres. When a user requests book data, the API handles filtering, pagination, and formatting of the response.

## 4 Risks

One of the main challenges I faced was optimizing how book metadata is fetched. At first, I assumed I could simply batch fetch data from the Gutendex API and repeat until I had enough books. However when I implemented this for multiple genres, loading the page took nearly three minutes. That’s when I realized I needed to build my own database and API to improve performance. Since I also plan to host everything on AWS, I don't want to store every full book in the database. Instead, I chose to store only the essential metadata, while keeping the actual book content as a link to Gutendex. This way, my API delivers metadata quickly, and book content is streamed directly from Gutendex, saving both storage space and server resources.

## Acknowledgements

A big thank you to the Gutendex API for providing all of these books for free! Make sure you check out their website at: https://www.gutenberg.org
