export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-400 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">
              Houston MFA
            </h3>
            <p className="text-sm leading-relaxed">
              Preserving creativity, culture, and stories through time.
            </p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">Visit Us</h4>
            <div className="space-y-2 text-sm">
              <p>
                123 Museum Avenue
                <br />
                Houston, TX 77004
              </p>
              <p>
                <a
                  href="mailto:HoustonMFA@museum.org"
                  className="text-neutral-300 hover:text-white transition-colors"
                >
                  HoustonMFA@museum.org
                </a>
              </p>
            </div>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">Hours</h4>
            <ul className="space-y-1 text-sm">
              <li>Mon – Thu: 10:00 AM – 5:00 PM</li>
              <li>Fri: 10:00 AM – 8:00 PM</li>
              <li>Sat – Sun: 11:00 AM – 6:00 PM</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/artists" className="hover:text-white transition-colors">
                  Artists
                </a>
              </li>
              <li>
                <a href="/artworks" className="hover:text-white transition-colors">
                  Artworks
                </a>
              </li>
              <li>
                <a href="/visitor" className="hover:text-white transition-colors">
                  Profile
                </a>
              </li>
              <li>
                <a href="/giftshop" className="hover:text-white transition-colors">
                  Gift Shop
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-neutral-800 pt-6">
          <p className="text-center text-sm text-neutral-500">
            © 2025 Houston Museum of Fine Arts. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
