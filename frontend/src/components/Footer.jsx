export default function Footer() {
  return (
    <footer className="bg-black text-gray-300 p-8">
      <div className="max-w-6xl mx-auto flex flex-wrap justify-around">
        <div>
          <h3 className="text-white text-lg mb-2">Houston Museum of Fine Arts</h3>
          <p>Preserving creativity, culture, and stories through time.</p>
        </div>

        <div>
          <h4 className="text-white text-md mb-2">Visit Us</h4>
          <p>123 Museum Avenue<br />Houston, TX 77004</p>
          <p><a href="mailto:HoutsonMFA@museum.org" className="text-red-400 hover:underline">HoutsonMFA@museum.org</a></p>
        </div>

        <div>
          <h4 className="text-white text-md mb-2">Explore</h4>
          <ul>
            <li><a href="/artists" className="hover:text-red-400">Artists</a></li>
            <li><a href="/artworks" className="hover:text-red-400">Artworks</a></li>
            <li><a href="/visitor" className="hover:text-red-400">Visitor </a></li>
            <li><a href="/giftshop" className="hover:text-red-400">Gift Shop</a></li>
          </ul>
        </div>
      </div>
      <div className="text-center border-t border-gray-700 mt-6 pt-3 text-sm text-gray-400">
        © 2025 Houston Museum of Fine Arts — All Rights Reserved
      </div>
    </footer>
  );
}
