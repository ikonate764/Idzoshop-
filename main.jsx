import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {createClient} from '@supabase/supabase-js';
import './style.css';
const url=import.meta.env.VITE_SUPABASE_URL, key=import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase=url&&key?createClient(url,key):null;
const demo=[{id:'d1',name:'Produit exemple',description:'Ajoute tes produits depuis Supabase',price:5000,image_url:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'}];
function App(){const [products,setProducts]=useState([]),[cart,setCart]=useState([]),[q,setQ]=useState(''),[loading,setLoading]=useState(true);
useEffect(()=>{(async()=>{if(!supabase){setProducts(demo);setLoading(false);return} const {data,error}=await supabase.from('products').select('*').order('created_at',{ascending:false});setProducts(error||!data?.length?demo:data);setLoading(false)})()},[]);
const shown=products.filter(p=>(p.name||'').toLowerCase().includes(q.toLowerCase())); const total=cart.reduce((s,p)=>s+Number(p.price),0);
return <div><header><b>Idzoshop</b><input placeholder="Rechercher..." value={q} onChange={e=>setQ(e.target.value)}/><span>🛒 {cart.length}</span></header><main><section className="hero"><h1>Bienvenue sur Idzoshop</h1><p>Ta boutique en ligne au Sénégal</p></section><h2>Produits</h2>{loading?<p>Chargement...</p>:<div className="grid">{shown.map(p=><article key={p.id}><img src={p.image_url||''}/><h3>{p.name}</h3><p>{p.description||''}</p><strong>{Number(p.price).toLocaleString('fr-FR')} FCFA</strong><button onClick={()=>setCart([...cart,p])}>Ajouter au panier</button></article>)}</div>}<div className="cart"><h2>Panier</h2>{cart.length?<><p>{cart.length} article(s) — <b>{total.toLocaleString('fr-FR')} FCFA</b></p><button onClick={()=>alert('Le paiement Wave sera connecté à l’étape suivante.')}>Commander</button></>:<p>Ton panier est vide.</p>}</div></main><footer>© 2026 Idzoshop</footer></div>}
createRoot(document.getElementById('root')).render(<App/>);
