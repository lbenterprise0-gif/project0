import React, { useEffect, useState } from 'react'
import SellerDashboard from './SellerDashboard'
import Login from './Login'
import Register from './Register'
import Wallet from './Wallet'
import AdminMappings from './AdminMappings'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api/v1'

export default function App(){
  const [listings, setListings] = useState([])
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState(10.0)

  useEffect(()=>{ fetchListings() }, [])

  useEffect(()=>{
    // restore token from localStorage
    const t = localStorage.getItem('p2p_token')
    if (t){
      axios.defaults.headers.common['Authorization'] = `Bearer ${t}`
    }
  }, [])

  async function fetchListings(){
    try{
      const r = await axios.get(`${API_BASE}/listings`)
      setListings(r.data)
    }catch(e){ console.warn(e) }
  }

  async function createListing(e){
    e.preventDefault()
    try{
      // For MVP we call the anonymous endpoint - note backend requires auth for create.
      const r = await axios.post(`${API_BASE}/listings`, { title, price })
      setTitle('')
      setPrice(0)
      fetchListings()
    }catch(e){
      alert('Request failed: ' + (e?.response?.data?.detail || e.message))
    }
  }

  return (
    <div style={{fontFamily:'Inter, system-ui', padding:20}}>
      <h1>P2P Marketplace — MVP</h1>

      <section style={{display:'flex', gap:12, marginTop:12}}>
        <div style={{flex:1}}>
          <h3>Sign in</h3>
          <Login setAuth={(t)=>{ axios.defaults.headers.common['Authorization'] = `Bearer ${t}` }} />
        </div>
        <div style={{flex:1}}>
          <h3>Create account</h3>
          <Register />
        </div>
        <div style={{flex:1}}>
          <h3>Wallet (simulate deposit)</h3>
          <Wallet />
        </div>
      </section>

      <section style={{marginTop:20}}>
        <h2>Create Listing</h2>
        <form onSubmit={createListing}>
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="title" />
          <input type="number" value={price} onChange={e=>setPrice(parseFloat(e.target.value))} />
          <button>Post</button>
        </form>
      </section>

      <section style={{marginTop:30}}>
        <h2>Seller Dashboard (demo)</h2>
        <SellerDashboard />
      </section>

      <section style={{marginTop:30}}>
        <h2>Admin</h2>
        <AdminMappings />
      </section>

      <section>
        <h2>Listings</h2>
        {listings.length===0 && <div>No listings yet</div>}
        <ul>
          {listings.map(l=> (
            <li key={l.id}>{l.title} — {l.price} {l.currency}</li>
          ))}
        </ul>
      </section>

      <footer style={{marginTop:40}}>
        <small>Backend API: {API_BASE}</small>
      </footer>
    </div>
  )
}
