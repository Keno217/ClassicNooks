export default function Navbar() {
  return (
    <header className='flex items-center p-4 border-b border-gray-300'>
      <div className='flex gap-8'>
        <h1 className='text-2xl'>BookWorm</h1>
        <nav className='flex items-center'>
          <ul className='flex items-center gap-8'>
            <li>
              <a>Home</a>
            </li>
            <li>
              <a>Library</a>
            </li>
          </ul>
        </nav>
      </div>
      <div className='flex ml-auto gap-2'>
        <form className='flex gap-2 bg-gray-200 py-2 px-4 rounded'>
          <button className='hover:cursor-pointer'>
            <img
              src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQO_c_aX1M5K8nKlEYvZvOdWstIgLagKrRtWT_7wlGV9lciKYuUzAj6uYnD_1OVqXxY6_4&usqp=CAU'
              width='24px'
              height='24px'
            ></img>
          </button>
          <input type='text' />
        </form>
        <img
          src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzSa0_z47xMCQstx5AUS2BGiWd0f4Rxnvs1Q&s'
          width='40px'
          height='40px'
        />
      </div>
    </header>
  );
}
