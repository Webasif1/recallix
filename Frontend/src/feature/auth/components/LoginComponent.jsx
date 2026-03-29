import React from 'react'
import { Link } from 'react-router'

const LoginComponent = (props) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">

      <form
        onSubmit={props.handleSubmit}
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
            value={props.email}
            onChange={(e) => props.setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full mt-2 p-2 rounded bg-[#0f0f0f] border border-gray-700 text-white focus:border-[#BF532B] outline-none"
          />
        </div>

        <div className="mb-6">
          <label className="text-gray-400 text-sm">Password</label>
          <input
            type="password"
            name="password"
            value={props.password}
            onChange={(e) => props.setPassword(e.target.value)}
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

export default LoginComponent
