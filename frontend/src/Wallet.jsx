import React, { useState } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api/v1'

export default function Wallet(){
  const [userId, setUserId] = useState('1')
  const [amount, setAmount] = useState(50)

  async function deposit(e){
    e.preventDefault()
    try{
      // Create a payment intent
      const r = await axios.post(`${API_BASE}/payments/intent`, null, { params: { user_id: parseInt(userId), amount: parseFloat(amount) }})
      const p = r.data.payment
      alert('Payment intent created: ' + p.provider_id)
      // simulate provider webhook success
      const event = { type: 'payment_intent.succeeded', data: { id: p.provider_id, user_id: parseInt(userId), amount: parseFloat(amount) } }
      await axios.post(`${API_BASE}/payments/webhook`, event)
      alert('Deposit completed')
    }catch(e){
      alert('Failed to deposit: ' + (e?.response?.data?.detail || e.message))
    }
  }

  return (
    <div>
      <form onSubmit={deposit}>
        <input value={userId} onChange={e=>setUserId(e.target.value)} placeholder='user id' />
        <input type='number' value={amount} onChange={e=>setAmount(parseFloat(e.target.value))} />
        <button>Deposit (simulate)</button>
      </form>
    </div>
  )
}
