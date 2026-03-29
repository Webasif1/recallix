import React, { useState } from 'react'
import { useAuth } from '../hook/useAuth'
import { useSelector } from 'react-redux'
import { useNavigate, Navigate, Link } from 'react-router'

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { handleLogin } = useAuth()

  const user = useSelector(state => state.auth.user)
  const loading = useSelector(state => state.auth.loading)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payLoad = {
      email,
      password
    }

    await handleLogin(payLoad)
    navigate("/")
    console.log(user)
  }
  // console.log(user)

  if (!loading && user) {
    return <Navigate to='/' />
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">

      <form
        onSubmit={handleSubmit}
        className="bg-[#181818] p-8 rounded-xl w-[360px] shadow-lg border border-[#2a2a2a]"
      >

        <h2 className="text-2xl font-bold text-white">
          Welcome Back
        </h2>

        <p className="text-gray-400 text-sm mt-2 mb-6">
          Login to access your account
        </p>

        <div className="mb-4">
          <label className="text-gray-400 text-sm">Email</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full mt-2 p-2 rounded bg-[#0f0f0f] border border-gray-700 text-white focus:border-[#BF532B] outline-none"
          />
        </div>

        <div className="mb-6">
          <label className="text-gray-400 text-sm">Password</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full mt-2 p-2 rounded bg-[#0f0f0f] border border-gray-700 text-white focus:border-[#BF532B] outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 rounded text-white font-semibold bg-[#BF532B] hover:bg-[#a84422] transition"
        >
          Login
        </button>

        <p className="text-gray-400 text-sm text-center mt-5">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-[#BF532B] hover:underline"
          >
            Register
          </Link>
        </p>

      </form>
    </div>
  )
}

export default Login
