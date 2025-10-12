import Navbar from '../components/Navbar.tsx';
import BookRail from '../components/BookRail.tsx';
import Footer from '@/components/Footer.tsx';

export default function Home() {
  // Orange Wave made with AI
  const waveBGElement = (
    <svg
      className='absolute bottom-0 left-0 w-full h-32 text-orange-500'
      preserveAspectRatio='none'
      viewBox='0 0 1440 320'
    >
      <path
        fill='currentColor'
        d='M0,160L48,186.7C96,213,192,267,288,266.7C384,267,480,213,576,170.7C672,128,768,96,864,117.3C960,139,1056,213,1152,224C1248,235,1344,181,1392,154.7L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z'
      />
    </svg>
  );

  /* Add a footer for ToS & acknowledge gutenberg,
  and a banner telling users books are dependent
  on their API */
  
  return (
    <div className='w-full h-full flex flex-col'>
      <Navbar />
      <div className='h-[33.33vh] flex items-center justify-center relative overflow-hidden bg-gradient-to-tr from-orange-600 to-orange-400 text-center px-2'>
        <h1 className='text-white text-3xl font-bold z-10'>
          Thousands of free classics, waiting for you to explore.
        </h1>
        {waveBGElement}
      </div>
      <main>
        <BookRail title='Trending' url='/api/books' />
        <BookRail title='Adventure' url='/api/books?genre=adventure' />
        <BookRail title='Fantasy' url='/api/books?genre=fantasy' />
        <BookRail title='Dystopian' url='/api/books?genre=dystopia' />
        <BookRail title='Sci-Fi' url='/api/books?genre=science%20fiction' />
        <BookRail title='Mystery' url='/api/books?genre=mystery' />
        <BookRail title='Romance' url='/api/books?genre=romance' />
        <BookRail title='Horror' url='/api/books?genre=horror' />
        <BookRail title='History' url='/api/books?genre=history' />
        <BookRail title='Fiction' url='/api/books?genre=fiction' />
        <BookRail title='Biography' url='/api/books?genre=biography' />
        <BookRail title='Education' url='/api/books?genre=education' />
      </main>
      <Footer />
    </div>
  );
}
