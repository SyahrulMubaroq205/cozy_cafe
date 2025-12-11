import React from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="w-full text-gray-800">

      {/* HERO SECTION */}
      <section className="relative w-full h-[85vh] flex items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=2070&auto=format&fit=crop"
          alt="Cafe Background"
          className="absolute inset-0 w-full h-full object-cover brightness-50"
        />

        <div className="relative z-10 text-center text-white px-6">
          <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">
            Welcome to Cozy Cafe
          </h1>
          <p className="text-xl max-w-2xl mx-auto mb-6 drop-shadow-md">
            Tempat sempurna untuk menikmati kopi berkualitas, makanan lezat,
            dan suasana hangat.
          </p>

          <Link
            to="/menu"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 
            rounded-xl text-white font-semibold text-lg shadow-lg transition"
          >
            View Menu
          </Link>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold mb-4">About Cozy Cafe</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Cozy Cafe adalah tempat terbaik untuk bersantai, bekerja, atau bertemu teman.
            Kami menyediakan berbagai pilihan kopi berkualitas tinggi, camilan lezat,
            dan suasana yang hangat untuk menemani setiap momen Anda.
          </p>
        </div>
      </section>

      {/* POPULAR MENU SECTION */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-10">Popular Menu</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Card 1 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
              <img
                src="https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80"
                alt="Coffee"
                className="w-full h-52 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Caramel Latte</h3>
                <p className="text-gray-600">
                  Kopi lembut dengan sentuhan karamel manis yang menggoda.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
              <img
                src="https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=1173&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Sandwich"
                className="w-full h-52 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Chicken Sandwich</h3>
                <p className="text-gray-600">
                  Sandwich ayam lembut dengan sayuran segar dan saus spesial.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
              <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80"
                alt="Pastry"
                className="w-full h-52 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Croissant</h3>
                <p className="text-gray-600">
                  Croissant lembut dan buttery, cocok untuk teman kopi Anda.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 bg-purple-600 text-white text-center">
        <p className="font-semibold">© {new Date().getFullYear()} Cozy Cafe. All rights reserved.</p>
      </footer>
    </div>
  );
}
