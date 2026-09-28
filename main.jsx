import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import "./style.css";

const SUPABASE_URL = "https://hhriagknzyvezbmrmqkb.supabase.co";
const SUPABASE_ANON_KEY =
  "sb_publishable_fHoX_HKWpVS-AsC-Q63xKA_7U3qi8Wn";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function money(value) {
  return new Intl.NumberFormat("fr-FR").format(Number(value || 0)) + " FCFA";
}

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProducts();

    const savedCart = localStorage.getItem("idzoshop_cart");

    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch {
        setCart([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("idzoshop_cart", JSON.stringify(cart));
  }, [cart]);

  async function loadProducts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur produits :", error);
      setMessage("Impossible de charger les produits.");
      setProducts([]);
    } else {
      setProducts(data || []);
    }

    setLoading(false);
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

    setTimeout(() => {
      setMessage("");
    }, 2000);
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

        <div className="cart-icon">
          🛒 {cartCount}
        </div>
      </header>

      <main>
        <section className="hero">
          <h1>Bienvenue sur Idzoshop</h1>
          <p>Ta boutique en ligne au Sénégal 🇸🇳</p>
        </section>

        {message && <div className="message">{message}</div>}

        <section className="products-section">
          <h2>
            {search ? "Résultats de recherche" : "Nos produits"}
          </h2>

          {loading ? (
            <div className="loading">Chargement des produits...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty">
              <h3>Aucun produit disponible</h3>
              <p>
                Ajoute tes produits dans la table{" "}
                <strong>products</strong> de Supabase.
              </p>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <article className="product-card" key={product.id}>
                  <div className="product-image">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                      />
                    ) : (
                      <div className="no-image">🛍️</div>
                    )}
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
            </div>

            <button
              className="checkout-button"
              onClick={() =>
                alert(
                  "La prochaine étape sera de connecter le paiement et la commande réelle."
                )
              }
            >
              Passer la commande
            </button>
          </section>
        )}
      </main>

      <footer>
        <p>© {new Date().getFullYear()} Idzoshop</p>
        <p>Commerce en ligne au Sénégal 🇸🇳</p>
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
