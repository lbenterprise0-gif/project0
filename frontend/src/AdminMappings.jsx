import React, { useEffect, useState } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api/v1'

export default function AdminMappings(){
  const [accounts, setAccounts] = useState([])
  const [selected, setSelected] = useState(null)
  const [mappings, setMappings] = useState([])
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState(null)
  const [listingInfo, setListingInfo] = useState(null)
  const [audits, setAudits] = useState([])

  useEffect(()=>{ fetchAccounts() }, [])

  async function fetchAccounts(){
    try{
      const r = await axios.get(`${API_BASE}/integrations/marketplaces/accounts`)
      setAccounts(r.data.accounts || [])
    }catch(e){ console.warn(e); setAccounts([]) }
  }

  async function fetchMappings(acc){
    setSelected(acc)
    setLoading(true)
    try{
      const r = await axios.get(`${API_BASE}/integrations/marketplaces/accounts/${acc.id}/mappings`)
      setMappings(r.data.mappings || [])
    }catch(e){ console.warn(e); setMappings([]) }
    setLoading(false)
    setDetail(null)
    setListingInfo(null)
  }

  async function resolve(mappingId, action){
    try{
      const r = await axios.post(`${API_BASE}/integrations/marketplaces/accounts/${selected.id}/mappings/${mappingId}/resolve`, { action })
      alert('Result: ' + JSON.stringify(r.data))
      // refresh mappings
      fetchMappings(selected)
    }catch(e){
      alert('Resolve failed: ' + (e?.response?.data?.detail || e.message))
    }
  }

  async function showDetail(m){
    setDetail(m)
    if (m.local_listing_id){
      try{
        const r = await axios.get(`${API_BASE}/listings/${m.local_listing_id}`)
        setListingInfo(r.data)
      }catch(e){ setListingInfo(null) }
    }else{
      setListingInfo(null)
    }
    // fetch audit trail
    try{
      const r2 = await axios.get(`${API_BASE}/integrations/marketplaces/accounts/${selected.id}/mappings/${m.id}/audits`)
      setAudits(r2.data.audits || [])
    }catch(e){ setAudits([]) }
  }

  return (
    <div style={{padding:12}}>
      <h2>Admin — Connector Mappings</h2>

      <div style={{display:'flex', gap:12}}>
        <div style={{flex:'0 0 300px', border:'1px solid #eee', padding:8}}>
          <h4>Connector Accounts</h4>
          {accounts.length === 0 && <div>No accounts found.</div>}
          {accounts.map(a => (
            <div key={a.id} style={{padding:6,borderBottom:'1px solid #f0f0f0'}}>
              <div><strong>{a.name}</strong> <small>({a.provider})</small></div>
              <div style={{marginTop:6}}>
                <button onClick={()=>fetchMappings(a)}>View mappings</button>
              </div>
            </div>
          ))}
        </div>

        <div style={{flex:1, border:'1px solid #eee', padding:8}}>
          {selected ? (
            <div>
              <h4>Mappings for {selected.name} ({selected.provider})</h4>
              {loading && <div>Loading...</div>}
              {!loading && mappings.length === 0 && <div>No mappings found for this account</div>}
              {!loading && mappings.map(m => (
                <div key={m.id} data-mapping-id={m.id} style={{padding:8, borderBottom:'1px solid #eee'}}>
                  <div><strong>Remote ID:</strong> {m.remote_id || '<none>'}</div>
                  <div><strong>Local listing:</strong> {m.local_listing_id || '<unlinked>'}</div>
                  <div style={{marginTop:6}}>
                    <button data-testid={`details-${m.id}`} onClick={()=>showDetail(m)}>Details</button>
                    <button data-testid={`remote-${m.id}`} onClick={()=>resolve(m.id, 'remote-wins')} style={{marginLeft:8}}>Remote wins</button>
                    <button data-testid={`local-${m.id}`} onClick={()=>resolve(m.id, 'local-wins')} style={{marginLeft:8}}>Local wins</button>
                    <button data-testid={`unlink-${m.id}`} onClick={()=>resolve(m.id, 'unlink')} style={{marginLeft:8}}>Unlink</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>Select a connector account to view mapping rows</div>
          )}
        </div>
      </div>

      {detail && (
        <div style={{marginTop:18, border:'1px solid #ddd', padding:10, background:'#fafafa'}}>
          <h4>Mapping details</h4>
          <div><strong>Remote ID:</strong> {detail.remote_id || '<none>'}</div>
          <div><strong>Local listing id:</strong> {detail.local_listing_id || '<unlinked>'}</div>
          <div style={{marginTop:8}}><strong>Metadata:</strong></div>
          <pre style={{whiteSpace:'pre-wrap', background:'#fff', padding:8, border:'1px solid #eee'}}>{detail.metadata || ''}</pre>
          {listingInfo && (
            <div style={{marginTop:8}}>
              <h5>Local listing</h5>
              <div><strong>Title:</strong> {listingInfo.title}</div>
              <div><strong>Price:</strong> {listingInfo.price} {listingInfo.currency}</div>
              <div><strong>Qty:</strong> {listingInfo.quantity}</div>
              <div><strong>Owner id:</strong> {listingInfo.owner_id}</div>
            </div>
          )}
          {audits && audits.length > 0 && (
            <div style={{marginTop:8}}>
              <h5>Audit trail</h5>
              {audits.map(a => (
                <div key={a.id} style={{padding:6, borderTop:'1px dashed #eee'}}>
                  <div><strong>action:</strong> {a.meta?.action}</div>
                  <div><strong>result:</strong> {a.meta?.result || ''}</div>
                  <div><small>by user {a.user_id} at {a.created_at}</small></div>
                </div>
              ))}
            </div>
          )}
          <div style={{marginTop:10}}>
            <button onClick={()=>{ setDetail(null); setListingInfo(null) }}>Close</button>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
