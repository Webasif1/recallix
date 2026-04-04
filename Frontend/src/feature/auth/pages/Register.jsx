import React, { useState } from 'react'
import { useAuth } from '../hook/useAuth'
import { useSelector } from 'react-redux'
import { Navigate,useNavigate } from 'react-router'
import RegisterComponents from '../components/RegisterComponents'

const Register = () => {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { handleRegister } = useAuth()

  const user = useSelector(state => state.auth.user)
  const loading = useSelector(state => state.auth.loading)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payLoad = {
      username,
      email,
      password
    }
    await handleRegister(payLoad)

    navigate("/dashboard")
  }

  if (!loading && user) {
    return <Navigate to="/dashboard" />
  }

  return (
    <RegisterComponents handleSubmit={handleSubmit} username={username} email={email} password={password} setUsername={setUsername} setEmail={setEmail} setPassword={setPassword} />
  )
}

export default Register
