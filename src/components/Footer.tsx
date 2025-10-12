import Link from 'next/link';

export default function Footer() {
  return (
    <footer className='w-full min-h-[50px] flex flex-col p-4 justify-center items-center bg-gradient-to-r from-orange-500 to-orange-400 text-white mt-auto'>
      <p>
        &copy; {new Date().getFullYear()} Kenan Velagic. All rights reserved.
      </p>
      <p>
        <Link className='underline' href='/privacy'>
          Privacy Policy
        </Link>
      </p>
    </footer>
  );
}
