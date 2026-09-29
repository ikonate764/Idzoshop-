import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import "./style.css";

const SUPABASE_URL = "https://hhriagknzyvezbmrmqkb.supabase.co";
const SUPABASE_ANON_KEY =
  "sb_publishable_fHoX_HKWpVS-AsC-Q63xKA_7U3qi8Wn";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function money(value) {
  return (
    new Intl.NumberFormat("fr-FR").format(Number(value || 0)) +
    " FCFA"
  );
}

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");

  const [user, setUser] = useState(null);

  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");const [customerName, setCustomerName] = useState("");
const [customerPhone, setCustomerPhone] = useState("");
const [deliveryAddress, setDeliveryAddress] = useState("");
const [city, setCity] = useState("");
const [orderLoading, setOrderLoading] = useState(false);const [orders, setOrders] = useState([]);
const [showAdmin, setShowAdmin] = useState(false);async function loadOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    setMessage("Erreur lors du chargement des commandes : " + error.message);
    return;
  }

  setOrders(data || []);
}

  useEffect(() => {
    loadProducts();
    loadSession();

    const savedCart = localStorage.getItem("idzoshop_cart");

    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch {
        setCart([]);
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem("idzoshop_cart", JSON.stringify(cart));
  }, [cart]);

  async function loadSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    setUser(session?.user || null);
  }

  async function loadProducts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setError("Impossible de charger les produits.");
    } else {
      setProducts(data || []);
    }

    setLoading(false);
  }

  async function handleAuth(e) {
    e.preventDefault();

    setAuthLoading(true);
    setError("");
    setMessage("");

    if (!email || !password) {
      setError("Entre ton email et ton mot de passe.");
      setAuthLoading(false);
      return;
    }

    if (authMode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        setError(error.message);
      } else if (data.session) {
        setUser(data.user);
        setShowAuth(false);
        setMessage("Compte créé avec succès 🎉");
      } else {
        setMessage(
          "Compte créé. Vérifie ton email pour confirmer ton compte."
        );
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        setUser(data.user);
        setShowAuth(false);
        setMessage("Connexion réussie 👋");
      }
    }

    setAuthLoading(false);
  }

  async function logout() {
    await supabase.auth.signOut();

    setUser(null);
    setMessage("Tu es déconnecté.");
  }async function handleOrder() {
  if (!user) {
    setMessage("Connecte-toi pour passer une commande.");
    return;
  }

  if (cart.length === 0) {
    setMessage("Ton panier est vide.");
    return;
  }

  if (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim()) {
    setMessage("Remplis ton nom, ton téléphone et ton adresse.");
    return;
  }

  setOrderLoading(true);
  setMessage("");

  const { data, error } = await supabase.rpc("create_order", {
    p_customer_name: customerName,
    p_customer_phone: customerPhone,
    p_delivery_address: `${deliveryAddress}${city ? `, ${city}` : ""}`,
    p_items: cart.map((item) => ({
      product_id: item.id,
      quantity: Number(item.quantity),
    })),
  });

  if (error) {
    setMessage("Erreur : " + error.message);
    setOrderLoading(false);
    return;
  }

  setMessage(
    `✅ Commande créée ! Numéro : ${data.order_number}`
  );

  setCart([]);
  setCustomerName("");
  setCustomerPhone("");
  setDeliveryAddress("");
  setCity("");
  setOrderLoading(false);
      }

  function addToCart(product) {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });

    setMessage(`${product.name} ajouté au panier 🛒`);

    setTimeout(() => setMessage(""), 2000);
  }

  function removeFromCart(id) {
    setCart((current) => current.filter((item) => item.id !== id));
  }

  function changeQuantity(id, quantity) {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCart((current) =>
      current.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  }

  const filteredProducts = products.filter((product) => {
    const text = search.toLowerCase();

    return (
      product.name?.toLowerCase().includes(text) ||
      product.description?.toLowerCase().includes(text)
    );
  });

  const cartCount = cart.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  const cartTotal = cart.reduce(
    (total, item) =>
      total + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  return (
    <div className="app">
      <header className="header">
        <div className="logo">Idzoshop</div>

        <div className="search">
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          className="account-button"
          onClick={() => setShowAuth(true)}
        >
          👤 {user ? "Mon compte" : "Connexion"}
        </button>

        <div className="cart-icon">🛒 {cartCount}</div>
      </header>

      <main>
        <section className="hero">
          <h1>Bienvenue sur Idzoshop</h1>
          <p>Ta boutique en ligne au Sénégal 🇸🇳</p>
        </section>

        {message && <div className="message">{message}</div>}
        {error && <div className="error">{error}</div>}

        {user && (
          <section className="account-card">
            <h2>👤 Mon compte</h2>
            <p>
              Connecté avec : <strong>{user.email}</strong>
            </p>

            <button className="logout-button" onClick={logout}>
              Se déconnecter
            </button>{user?.email === "idzoshop50@gmail.com" && (
  <button
    className="logout-button"
    onClick={() => {
      setShowAdmin(true);
      loadOrders();
    }}
  >
    📦 Voir les commandes
  </button>
)}
          </section>
        )}

        <section className="products-section">
          <h2>Nos produits</h2>

          {loading ? (
            <div className="loading">Chargement des produits...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty">
              <h3>Aucun produit disponible</h3>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <article className="product-card" key={product.id}>
                  <div className="product-gallery">
  <img
    src="https://hhriagknzyvezbmrmqkb.supabase.co/storage/v1/object/public/products/1790456751367.png"
    alt="Ceinture électrique - photo 1"
  />

  <img
    src="https://hhriagknzyvezbmrmqkb.supabase.co/storage/v1/object/public/products/1790456758840.png"
    alt="Ceinture électrique - photo 2"
  />

  <img
    src="https://hhriagknzyvezbmrmqkb.supabase.co/storage/v1/object/public/products/1790456766261.png"
    alt="Ceinture électrique - photo 3"
  />
</div>

                  <div className="product-info">
                    <h3>{product.name}</h3>

                    {product.description && (
                      <p>{product.description}</p>
                    )}

                    <strong className="price">
                      {money(product.price)}
                    </strong>

                    <button
                      className="add-button"
                      onClick={() => addToCart(product)}
                    >
                      Ajouter au panier
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {cart.length > 0 && (
          <section className="cart-section">
            <h2>🛒 Mon panier</h2>

            {cart.map((item) => (
              <div className="cart-item" key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <p>{money(item.price)}</p>
                </div>

                <div className="quantity">
                  <button
                    onClick={() =>
                      changeQuantity(item.id, item.quantity - 1)
                    }
                  >
                    −
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() =>
                      changeQuantity(item.id, item.quantity + 1)
                    }
                  >
                    +
                  </button>
                </div>

                <button
                  className="delete-button"
                  onClick={() => removeFromCart(item.id)}
                >
                  Supprimer
                </button>
              </div>
            ))}

            <div className="cart-total">
              <strong>Total</strong>
              <strong>{money(cartTotal)}</strong>
            </div><div className="checkout">
  <h3>📦 Passer la commande</h3>

  <input
  type="text"
  placeholder="Nom complet"
  value={customerName}
  onChange={(e) => setCustomerName(e.target.value)}
/>

  <input
  type="tel"
  placeholder="Numéro de téléphone"
  value={customerPhone}
  onChange={(e) => setCustomerPhone(e.target.value)}
/>

  <input
  type="text"
  placeholder="Adresse de livraison"
  value={deliveryAddress}
  onChange={(e) => setDeliveryAddress(e.target.value)}
/>

  <input
  type="text"
  placeholder="Ville"
  value={city}
  onChange={(e) => setCity(e.target.value)}
/>

  <p>💵 Paiement à la livraison</p>

  <button type="button" onClick={handleOrder} disabled={orderLoading}>
  {orderLoading ? "Commande en cours..." : "Commander"}
</button>
</div>
          </section>
        )}
      </main>

      {showAuth && (
        <div className="modal">
          <div className="auth-box">
            <button
              className="close-button"
              onClick={() => setShowAuth(false)}
            >
              ×
            </button>

            <h2>
              {authMode === "login"
                ? "Connexion"
                : "Créer un compte"}
            </h2>

            <form onSubmit={handleAuth}>
              {authMode === "signup" && (
                <input
                  type="text"
                  placeholder="Nom complet"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              )}

              <input
                type="email"
                placeholder="Adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                className="auth-submit"
                type="submit"
                disabled={authLoading}
              >
                {authLoading
                  ? "Chargement..."
                  : authMode === "login"
                  ? "Se connecter"
                  : "Créer mon compte"}
              </button>
            </form>

            <button
              className="switch-auth"
              onClick={() => {
                setAuthMode(
                  authMode === "login" ? "signup" : "login"
                );
                setError("");
                setMessage("");
              }}
            >
              {authMode === "login"
                ? "Créer un nouveau compte"
                : "J'ai déjà un compte"}
            </button>
          </div>
        </div>
      )}

      <footer>
        <p>© {new Date().getFullYear()} Idzoshop</p>
        <p>Commerce en ligne au Sénégal 🇸🇳</p>
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
