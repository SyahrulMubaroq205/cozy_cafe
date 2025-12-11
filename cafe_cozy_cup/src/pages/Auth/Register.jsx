import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthProvider';
import API from '../../api/api';

const Register = () => {
  const { register } = useContext(AuthContext); // <-- GANTI LOGIN → REGISTER

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await API.post('/register', { name, email, password });

      if (res.data.success) {
        const userData = res.data.data.user;
        const tokenValue = res.data.data.token;

        // GUNAKAN register() AGAR AUTO LOGIN
        register(userData, tokenValue);

      } else {
        setError(res.data.message || 'Register gagal');
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Register gagal');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center text-purple-600">
          Buat Akun Baru
        </h2>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nama lengkap"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          />

          <input
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          />

          <input
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          />

          <button
            type="submit"
            className="w-full py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg shadow-md transition-all duration-200"
          >
            Register
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm">
          Sudah punya akun?{' '}
          <a href="/login" className="text-purple-500 hover:underline">
            Masuk di sini
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
