import React, { useState } from 'react'
import { useAuth } from '../hook/useAuth'
import { useSelector } from 'react-redux'
import { useNavigate, Navigate } from 'react-router'
import LoginComponent from '../components/LoginComponent'

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
  }
  console.log(user)

  if (!loading && user) {
    return <Navigate to='/' />
  }
  return (
    <LoginComponent handleSubmit={handleSubmit} email={email} password={password} setEmail={setEmail} setPassword={setPassword} />
  )
}

export default Login
