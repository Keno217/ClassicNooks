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

8/21/25 – About a month into development. The hardest task by far has been parsing the book text after proxying the fetch request from my API for Gutendex. I have to use regex to extract the contents of pages for chapters, tables, contents, etc. Many of these books are in different languages or old English, and not every book follows the same conventions for structuring content.

The best way to handle this data (in my approach) is to return something like:

```json
[
  {
    "title": "Table of Contents",
    "chapters": [
      "Chapter 1: The Beginning",
      "Chapter 2: The Journey",
      "Chapter 3: The End"
    ]
  },
  {
    "title": "Chapter 1",
    "content": "Once upon a time..."
  },
  {
    "title": "Chapter 2",
    "content": "The next day..."
  }
]
```

Then, on the frontend you can map out this array. This allows the frontend to handle each major transition and ensures that titles don’t appear inline with the rest of the content.

I believe I could implement this without a doubt, but is it worth it? My goal for this project was to practice the fundamentals of web development. From APIs to security, authorization, and frontend work. I don’t want to spend the majority of my time handling every edge case just to make a fully functional reading page. Instead, I’ll have the reading page link directly to the Project Gutenberg HTML book.

Unfortunately, this change reduces the scope of the project from what I originally intended. Users will no longer be able to track the page they were last on, or gather statistics like how long they’ve spent reading. Maybe one day in the future I’ll come back and implement this properly.

## Acknowledgements

A big thank you to the Gutendex API for providing all of these books for free! Make sure you check out their website at: https://www.gutenberg.org
