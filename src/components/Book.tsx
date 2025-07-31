export default function Book({
  title,
  author,
  cover,
}: {
  title: string;
  author: string;
  cover: string;
}) {
  return (
    <figure className='flex-shrink-0 w-[160px] text-center'>
      <div className='w-full h-[250px] bg-gray-100 rounded overflow-hidden'>
        <img
          className='w-full h-full object-fill'
          src={cover}
          alt={`Cover of ${title} by ${author}`}
        />
      </div>
      <figcaption className='mt-2 text-sm line-clamp-2'>{title}</figcaption>
    </figure>
  );
}
