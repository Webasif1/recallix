import React, { useState } from 'react'
import { useAuth } from '../hook/useAuth'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router'
import RegisterComponents from '../components/RegisterComponents'

const Register = () => {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { handleRegister } = useAuth()

  const user = useSelector(state => state.auth.user)
  const loading = useSelector(state => state.auth.loading)

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleRegister({
      username,
      email,
      password
    })
  }

  if (user && !user.verified) {
    return (
      <div className="w-full h-screen bg-zinc-900 flex justify-center items-center px-4">
        <div className="bg-zinc-800 rounded-2xl shadow-lg p-8 max-w-md w-full text-center space-y-4">
          <div className="text-4xl">📩</div>

          <h2 className="text-2xl font-semibold text-white">
            Check your email
          </h2>

          <p className="text-sm text-zinc-400">
            We sent a verification link to
          </p>

          <p className="text-sm text-cyan-400 font-medium break-all">
            {email}
          </p>

        </div>
      </div>
    )
  }

  if (!loading && user && user.verified) {
    return <Navigate to="/" />
  }

  return (
    <RegisterComponents handleSubmit={handleSubmit} username={username} email={email} password={password} setUsername={setUsername} setEmail={setEmail} setPassword={setPassword} />
  )
}

export default Register
