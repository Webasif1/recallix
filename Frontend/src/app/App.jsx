import React,{useEffect} from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './app.route'
import { useAuth } from '../feature/auth/hook/useAuth'

const App = () => {
  const auth = useAuth()


  useEffect(()=>{
    auth.handleGetMe()
  },[])
  return (
    <RouterProvider router={router} />
  )
}

export default App
