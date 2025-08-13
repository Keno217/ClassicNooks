import Navbar from '../components/Navbar.tsx';
import BookRail from '../components/BookRail.tsx';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <BookRail title='Trending' url='http://localhost:3000/api/books' />
        <BookRail
          title='Adventure'
          url='http://localhost:3000/api/books?genre=adventure'
        />
        <BookRail
          title='Fantasy'
          url='http://localhost:3000/api/books?genre=fantasy'
        />
        <BookRail
          title='Dystopian'
          url='http://localhost:3000/api/books?genre=dystopia'
        />
        <BookRail
          title='Sci-Fi'
          url='http://localhost:3000/api/books?genre=science%20fiction'
        />
        <BookRail
          title='Mystery'
          url='http://localhost:3000/api/books?genre=mystery'
        />
        <BookRail
          title='Romance'
          url='http://localhost:3000/api/books?genre=romance'
        />
        <BookRail
          title='Horror'
          url='http://localhost:3000/api/books?genre=horror'
        />
        <BookRail
          title='History'
          url='http://localhost:3000/api/books?genre=history'
        />
        <BookRail
          title='Fiction'
          url='http://localhost:3000/api/books?genre=fiction'
        />
        <BookRail
          title='Biography'
          url='http://localhost:3000/api/books?genre=biography'
        />
        <BookRail
          title='Education'
          url='http://localhost:3000/api/books?genre=education'
        />
      </main>
    </>
  );
}
