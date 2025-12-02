import React, { useState } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api/v1'

export default function Login({ setAuth }){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  async function doLogin(e){
    e.preventDefault()
    try{
      const params = new URLSearchParams()
      params.append('username', username)
      params.append('password', password)
      const r = await axios.post(`${API_BASE}/auth/token`, params)
      const token = r.data.access_token
      localStorage.setItem('p2p_token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      if (setAuth) setAuth(token)
      alert('Logged in')
    }catch(e){
      alert('Login failed: ' + (e?.response?.data?.detail || e.message))
    }
  }

  return (
    <form onSubmit={doLogin}>
      <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="username or email" />
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" />
      <button>Login</button>
    </form>
  )
}
