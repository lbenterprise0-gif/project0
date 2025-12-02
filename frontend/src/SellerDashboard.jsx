import React, { useEffect, useState } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api/v1'

export default function SellerDashboard(){
  const [listings, setListings] = useState([])
  const [balance, setBalance] = useState(0)

  useEffect(()=>{ fetchData() }, [])

  async function fetchData(){
    try{
      // demo user id 1
      const r = await axios.get(`${API_BASE}/users/1/listings`)
      setListings(r.data)
      const b = await axios.get(`${API_BASE}/wallet/balance/1`)
      setBalance(b.data.balance)
    }catch(e){ console.warn(e) }
  }

  async function postToConnectors(listingId){
    try{
      const r = await axios.post(`${API_BASE}/integrations/marketplaces/post`, { listing_id: listingId })
      alert('Posted: ' + JSON.stringify(r.data.posted))
    }catch(e){ alert('Failed: ' + (e?.response?.data?.detail || e.message)) }
  }

  return (
    <div style={{border:'1px solid #eee', padding:12}}>
      <div style={{display:'flex', justifyContent:'space-between'}}>
        <div><strong>Seller (demo)</strong></div>
        <div>Wallet: <strong>{balance}</strong></div>
      </div>

      <h3>Your Listings</h3>
      {listings.map(l=> (
        <div key={l.id} style={{padding:10,border:'1px dashed #ddd',margin:8}}>
          <div style={{fontWeight:600}}>{l.title}</div>
          <div>{l.description}</div>
          <div>{l.price} {l.currency} — {l.quantity} available</div>
          <div style={{marginTop:8}}>
            <button onClick={()=>postToConnectors(l.id)}>Post to marketplaces</button>
            <button onClick={async ()=>{
              const bid = parseFloat(prompt('Enter promotion bid amount (USD):', '10'))
              if (!isNaN(bid)){
                await axios.post(`${API_BASE}/promotions/bid`, null, { params: { listing_id: l.id, bidder_user_id: 1, amount: bid } })
                alert('Promotion bid submitted')
              }
            }} style={{marginLeft:8}}>Place promotion bid</button>

            <button onClick={async ()=>{
              const msg = prompt('Enter message to buyer support / chat:')
              if (msg) {
                await axios.post(`${API_BASE}/chat/send`, null, { params: { sender_id: 1, recipient_id: null, listing_id: l.id, content: msg } })
                alert('Message sent')
              }
            }} style={{marginLeft:8}}>Send chat message</button>
          </div>
        </div>
      ))}

      {listings.length === 0 && <div>No listings (try creating one as user id 1)</div>}
    </div>
  )
}
