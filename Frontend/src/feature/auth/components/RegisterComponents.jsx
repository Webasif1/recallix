import React from 'react'
import { Link } from 'react-router'

const RegisterComponents = (props) => {
  return (
    <div> <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">

      <form
        onSubmit={props.handleSubmit}
        className="bg-[#181818] p-8 rounded-xl w-[400px] shadow-lg border border-[#2a2a2a]"
      >

        <h2 className="text-2xl font-bold text-white">
          Create Account
        </h2>

        <p className="text-gray-400 text-sm mt-2 mb-6">
          Register to get started
        </p>

        <div className="mb-4">
          <label className="text-gray-400 text-sm">Username</label>
          <input
            type="text"
            name="username"
            value={props.username}
            onChange={(e) => props.setUsername(e.target.value)}
            placeholder="Enter username"
            className="w-full mt-2 p-2 rounded bg-[#0f0f0f] border border-gray-700 text-white focus:border-[#BF532B] outline-none"
          />
        </div>

        <div className="mb-4">
          <label className="text-gray-400 text-sm">Email</label>
          <input
            type="email"
            name="email"
            value={props.email}
            onChange={(e) => props.setEmail(e.target.value)}
            placeholder="Enter email"
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
            placeholder="Enter password"
            className="w-full mt-2 p-2 rounded bg-[#0f0f0f] border border-gray-700 text-white focus:border-[#BF532B] outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 rounded text-white font-semibold bg-[#BF532B] hover:bg-[#a84422] transition cursor-pointer"
        >
          Register
        </button>

        <p className="text-gray-400 text-sm text-center mt-5">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#BF532B] hover:underline cursor-pointer"
          >
            Login
          </Link>
        </p>

      </form>
    </div></div>
  )
}

export default RegisterComponents
