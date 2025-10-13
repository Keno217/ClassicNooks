import Link from 'next/link';
import Image from 'next/image';

export default function BookCard({
  id,
  title,
  author,
  cover,
}: {
  id: number;
  title: string;
  author: string;
  cover: string;
}) {
  return (
    <figure
      className='flex-shrink-0 w-[160px] md:w-[180px] text-center'
      role='listitem'
    >
      <Link
        href={`/books/${id}`}
        className='block'
        aria-label={`View details for ${title} by ${author}`}
      >
        <div className='group w-full h-[240px] md:h-[270px] bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 hover:border-amber-200 transition-all duration-300'>
          <Image
            className='w-full h-full object-cover transition-all duration-300'
            src={cover || '/icons/bookCoverIcon.png'}
            width={192}
            height={120}
            alt={`Cover of ${title} by ${author}`}
          />
        </div>
      </Link>
      <figcaption className='mt-3 space-y-1'>
        <h3 className='text-sm font-medium text-gray-900 line-clamp-2 leading-tight transition-colors duration-200'>
          {title}
        </h3>
        <p className='text-xs text-gray-600 line-clamp-1'>{author}</p>
      </figcaption>
    </figure>
  );
}
