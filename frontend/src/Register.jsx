import React, { useState } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api/v1'

export default function Register(){
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function doRegister(e){
    e.preventDefault()
    try{
      const r = await axios.post(`${API_BASE}/users/register`, { username, email, password })
      const user = r.data
      alert('Registered user id: ' + user.id)
    }catch(e){
      alert('Register failed: ' + (e?.response?.data?.detail || e.message))
    }
  }

  return (
    <form onSubmit={doRegister}>
      <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="username" />
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" />
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" />
      <button>Create</button>
    </form>
  )
}
