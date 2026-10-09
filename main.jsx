import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import "./style.css";

const SUPABASE_URL = "https://hhriagknzyvezbmrmqkb.supabase.co";
const SUPABASE_ANON_KEY =
  "sb_publishable_fHoX_HKWpVS-AsC-Q63xKA_7U3qi8Wn";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
function ProductGallery({ product }) {
  const images =
    Array.isArray(product.image_urls) && product.image_urls.length > 0
      ? product.image_urls
      : [product.image_url || product.image].filter(Boolean);

  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState(null);

  if (images.length === 0) {
    return (
      <div className="product-gallery">
        <div className="no-image">Aucune photo</div>
      </div>
    );
  }

  const previousImage = () => {
    setCurrent((index) =>
      index === 0 ? images.length - 1 : index - 1
    );
  };

  const nextImage = () => {
    setCurrent((index) =>
      index === images.length - 1 ? 0 : index + 1
    );
  };

  const handleTouchStart = (event) => {
    setTouchStart(event.touches[0].clientX);
  };

  const handleTouchEnd = (event) => {
    if (touchStart === null) return;

    const distance =
      event.changedTouches[0].clientX - touchStart;

    if (Math.abs(distance) > 50) {
      if (distance < 0) {
        nextImage();
      } else {
        previousImage();
      }
    }

    setTouchStart(null);
  };

  return (
    <div
      className="product-gallery"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="gallery-main">

        <div
          className="gallery-track"
          style={{
            transform: `translateX(-${current * 100}%)`,
          }}
        >
          {images.map((image, index) => (
            <div
              className="gallery-slide"
              key={image + index}
            >
              <img
                src={image}
                alt={`${product.name} - photo ${index + 1}`}
              />
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              className="gallery-arrow gallery-prev"
              onClick={previousImage}
              aria-label="Photo précédente"
            >
              ‹
            </button>

            <button
              type="button"
              className="gallery-arrow gallery-next"
              onClick={nextImage}
              aria-label="Photo suivante"
            >
              ›
            </button>
          </>
        )}

        {images.length > 1 && (
          <div className="gallery-dots">
            {images.map((_, index) => (
              <button
                type="button"
                key={index}
                className={
                  current === index ? "active" : ""
                }
                onClick={() => setCurrent(index)}
                aria-label={`Afficher la photo ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="gallery-thumbnails">
          {images.map((image, index) => (
            <button
              type="button"
              key={image + index}
              className={`gallery-thumbnail ${
                current === index ? "active" : ""
              }`}
              onClick={() => setCurrent(index)}
              aria-label={`Afficher la photo ${index + 1}`}
            >
              <img
                src={image}
                alt=""
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
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
const [selectedCategory, setSelectedCategory] = useState("");
  const [user, setUser] = useState(null);

  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [customerName, setCustomerName] = useState("");
const [customerPhone, setCustomerPhone] = useState("");
const [deliveryAddress, setDeliveryAddress] = useState("");
const [city, setCity] = useState("");
const [orderLoading, setOrderLoading] = useState(false);
  const [orders, setOrders] = useState([]);
const [showAdmin, setShowAdmin] = useState(false);
  const [profile, setProfile] = useState(null);
const [categories, setCategories] = useState([]);
const [myStore, setMyStore] = useState(null);
const [showProductManager, setShowProductManager] = useState(false);
const [editingProduct, setEditingProduct] = useState(null);
const [productName, setProductName] = useState("");
const [productDescription, setProductDescription] = useState("");
const [productPrice, setProductPrice] = useState("");
const [productStock, setProductStock] = useState("");
const [productCategory, setProductCategory] = useState("");
const [productImage, setProductImage] = useState("");
const [productSaving, setProductSaving] = useState(false);async function loadOrders() {
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
  loadCategories();
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
    const currentUser = session?.user || null;
    setUser(currentUser);

    if (!currentUser) {
      setProfile(null);
      setMyStore(null);
    }
  });

  return () => subscription.unsubscribe();
}, []);

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
async function loadProfile() {
  if (!user) {
    setProfile(null);
    setMyStore(null);
    return;
  }

  const { data: profileData, error: profileError } =
    await supabase
      .from("profiles")
      .select("id, full_name, role")
      .eq("id", user.id)
      .maybeSingle();

  if (profileError) {
    setMessage("Erreur de profil : " + profileError.message);
    return;
  }

  setProfile(profileData);

  const { data: storeData, error: storeError } =
    await supabase
      .from("stores")
      .select("id, name, owner_id, status")
      .eq("owner_id", user.id)
      .maybeSingle();

  if (storeError) {
    setMessage("Erreur de boutique : " + storeError.message);
    return;
  }

  setMyStore(storeData);
}

async function loadCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("active", true)
    .order("name");

  if (error) {
    setMessage("Erreur de catégories : " + error.message);
    return;
  }

  setCategories(data || []);
    }
  async function loadProducts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
.select("*, categories(name, slug)")
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
  }

async function updateOrderStatus(orderId, status) {
  const { error } = await supabase.rpc("update_order_status", {
    p_order_id: orderId,
    p_status: status,
  });

  if (error) {
    setMessage("Erreur : " + error.message);
    return;
  }

  setMessage("✅ Statut de la commande mis à jour.");
  loadOrders();
}



  

async function handleOrder() {
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

  

const normalizeCategory = (value = "") =>
String(value)
.toLowerCase()
.normalize("NFD")
.replace(/[\u0300-\u036f]/g, "")
.replace(/&/g, " ")
.replace(/[^a-z0-9]+/g, "")
.trim();

const filteredProducts = products.filter((product) => {
if (selectedCategory) {
const selected = normalizeCategory(selectedCategory);
const slug = normalizeCategory(product.categories?.slug);
const name = normalizeCategory(product.categories?.name);

const matchesCategory =
  slug === selected ||
  name === selected ||
  slug.includes(selected) ||
  name.includes(selected);

if (!matchesCategory) return false;

}

const text = search.toLowerCase();

return (
product.name?.toLowerCase().includes(text) ||
product.description?.toLowerCase().includes(text) ||
product.categories?.name?.toLowerCase().includes(text)
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
    <div className="top-bar">
  <span>🚚 Livraison rapide partout au Sénégal 🇸🇳</span>
  <span>🛡 Paiement à la livraison ou en ligne</span>
  <span>🎧 Service client disponible 7j/7</span>
</div>
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

        <button
  className="cart-icon"
  onClick={() => document.getElementById("panier")?.scrollIntoView({ behavior: "smooth" })}
>
  🛒 {cartCount}
</button>
      </header><nav className="main-nav">
  <button className="categories-button">☰ Toutes les catégories</button>
  <a href="#accueil">Accueil</a>
  <a href="#boutique">Boutique</a>
  <a href="#promotions">Promotions</a>
  <a href="#apropos">À propos</a>
  <a href="#contact">Contact</a>
</nav>

      <main>
        <section id="accueil" className="hero">
  <div className="hero-content">
    <span className="hero-badge">🇸🇳 Boutique en ligne au Sénégal</span>

    <h1>Vos achats en ligne, plus simples !</h1>

    <p>
      Des produits de qualité, aux meilleurs prix,
      livrés directement chez vous.
    </p>

    <a href="#boutique" className="hero-button">
      Découvrir la boutique →
    </a>

    <div className="hero-benefits">
      <span>🚚 Livraison rapide</span>
      <span>🔒 Paiement sécurisé</span>
      <span>↩️ Retour facile</span>
    </div>
  </div>
</section>
<section className="categories-section">
  <div className="section-heading">
    <h2>Nos catégories</h2>
    <p>Découvrez nos différentes catégories</p>
  </div>

  <div className="categories-grid">
  <button className="category-card" onClick={() => setSelectedCategory("electronique")}>
    📱 <span>Électronique</span>
  </button>

  <button className="category-card" onClick={() => setSelectedCategory("mode")}>
    👕 <span>Mode</span>
  </button>

  <button className="category-card" onClick={() => setSelectedCategory("maison")}>
    🏠 <span>Maison & Cuisine</span>
  </button>

  <button className="category-card" onClick={() => setSelectedCategory("beauté")}>
    💄 <span>Beauté & Santé</span>
  </button>

  <button className="category-card" onClick={() => setSelectedCategory("sport")}>
    ⚽ <span>Sport & Loisirs</span>
  </button>

  <button className="category-card" onClick={() => setSelectedCategory("enfants")}>
    🧸 <span>Enfants & Jouets</span>
  </button>

  <button className="category-card" onClick={() => setSelectedCategory("accessoires")}>
    🎒 <span>Accessoires</span>
  </button>

  <button className="category-card" onClick={() => setSelectedCategory("telephonie")}>
    📞 <span>Téléphonie</span>
  </button>

  <button className="category-card" onClick={() => setSelectedCategory("")}>
    🛍️ <span>Tous les produits</span>
  </button>
</div>
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
        )}{showAdmin && (
  <section className="account-card">
    <h2>📦 Commandes reçues</h2>

    <button
      className="logout-button"
      onClick={() => setShowAdmin(false)}
    >
      Fermer
    </button>

    {orders.length === 0 ? (
      <p>Aucune commande pour le moment.</p>
    ) : (
      orders.map((order) => (
        <div key={order.id} className="order-card">
          <h3>Commande {order.order_number}</h3>

          <p>
            <strong>Client :</strong> {order.customer_name}
          </p>

          <p>
            <strong>Téléphone :</strong> {order.customer_phone}
          </p>

          <p>
            <strong>Adresse :</strong> {order.delivery_address}
          </p>

          <p>
            <strong>Total :</strong> {Number(order.total).toLocaleString()} FCFA
          </p>

          <p>
  <strong>Statut :</strong>
  <select
    value={order.status}
    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
  >
    <option value="pending">En attente</option>
    <option value="confirmed">Confirmée</option>
    <option value="shipped">Expédiée</option>
    <option value="delivered">Livrée</option>
    <option value="cancelled">Annulée</option>
  </select>
</p>

          <p>
            <strong>Paiement :</strong> {order.payment_status}
          </p>
        </div>
      ))
    )}
  </section>
)}

        <section id="boutique" className="products-section">
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
                  <ProductGallery product={product} />

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
  disabled={product.stock <= 0}
>
  {product.stock > 0 ? "Ajouter au panier" : "Rupture de stock"}
</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section><section className="service-strip">
  <div>
    <span>🚚</span>
    <strong>Livraison rapide</strong>
    <small>Partout au Sénégal</small>
  </div>

  <div>
    <span>🔒</span>
    <strong>Paiement sécurisé</strong>
    <small>À la livraison ou en ligne</small>
  </div>

  <div>
    <span>↩️</span>
    <strong>Retour facile</strong>
    <small>Selon nos conditions</small>
  </div>

  <div>
    <span>🎧</span>
    <strong>Service client</strong>
    <small>Disponible 7j/7</small>
  </div>
</section>

        {cart.length > 0 && (
          <section id="panier"className="cart-section">
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
<footer className="footer">
  <div className="footer-content">

    <div className="footer-brand">
      <h2>🛍️ Idzoshop</h2>
      <p>Tout ce dont vous avez besoin, au meilleur prix.</p>
      <p>🇸🇳 Votre boutique en ligne au Sénégal.</p>
    </div>

    <div>
      <h3>Navigation</h3>
      <a href="#accueil">Accueil</a>
      <a href="#boutique">Boutique</a>
      <a href="#promotions">Promotions</a>
      <a href="#apropos">À propos</a>
      <a href="#contact">Contact</a>
    </div>

    <div>
      <h3>Nos services</h3>
      <a href="#boutique">Nos produits</a>
      <a href="#livraison">Livraison</a>
      <a href="#paiement">Paiement sécurisé</a>
      <a href="#retour">Retour facile</a>
    </div>

    <div>
      <h3>Contact</h3>
      <p>📞 Service client</p>
      <p>📧 Contactez-nous</p>
      <p>🇸🇳 Sénégal</p>
      <p>🎧 Disponible 7j/7</p>
    </div>

  </div>

  <div className="footer-bottom">
    <p>© 2026 Idzoshop — Tous droits réservés.</p>
  </div>
</footer>
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

      
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
