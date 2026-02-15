// src/pages/Test.tsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Define the shape of the state passed from SignUp
interface SignUpData {
  name: string;
  email: string;
  password: string;
}

const Test: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as SignUpData | null;

  if (!state) {
    return (
      <main className="min-h-screen bg-stone-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p>No signup data received.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded"
          >
            Go Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-950 text-white p-6">
      <h1 className="text-3xl font-semibold mb-6 text-center">Signup Data</h1>
      <div className="space-y-4 max-w-md mx-auto bg-stone-800 p-6 rounded-lg">
        <p><strong>Name:</strong> {state.name}</p>
        <p><strong>Email:</strong> {state.email}</p>
        <p><strong>Password:</strong> {state.password}</p>
      </div>
    </main>
  );
};

export default Test;
