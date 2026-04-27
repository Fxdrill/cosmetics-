// ============================================
// LUXEGREEN COSMETICS — FIREBASE & SHARED UTILS
// ============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc, query, where, orderBy, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzs55tyeteetetetweea...",
  authDomain: "asgloa.firebaseapp.com",
  projectId: "yoursfsfsfproject",
  storageBucket: "yourproject.appspot.com",
  messagingSenderId: "1234sfsaf56789",
  appId: "1:123..."
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// ============================================
// CLOUDINARY CONFIG
// ============================================
export const CLOUDINARY_CLOUD = "ursnauufn";
export const CLOUDINARY_UPLOAD_PRESET = "luxegreen_unsigned"; // Create this unsigned preset in Cloudinary dashboard

// ============================================
// WHATSAPP
// ============================================
export const WHATSAPP_NUMBER = "2348012345678";

// ============================================
// PRODUCT FUNCTIONS
// ============================================
export async function getProducts(categoryFilter = null) {
  try {
    let q;
    if (categoryFilter && categoryFilter !== "All") {
      q = query(collection(db, "products"), where("category", "==", categoryFilter), orderBy("createdAt", "desc"));
    } else {
      q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    }
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error("getProducts error:", e);
    return [];
  }
}

export async function addProduct(data) {
  return await addDoc(collection(db, "products"), { ...data, createdAt: serverTimestamp() });
}

export async function updateProduct(id, data) {
  return await updateDoc(doc(db, "products", id), data);
}

export async function deleteProduct(id) {
  return await deleteDoc(doc(db, "products", id));
}

// ============================================
// CATEGORY FUNCTIONS
// ============================================
export async function getCategories() {
  try {
    const snap = await getDocs(collection(db, "categories"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error("getCategories error:", e);
    return defaultCategories();
  }
}

export async function addCategory(data) {
  return await addDoc(collection(db, "categories"), { ...data, createdAt: serverTimestamp() });
}

export async function deleteCategory(id) {
  return await deleteDoc(doc(db, "categories", id));
}

function defaultCategories() {
  return [
    { id: "soaps", name: "Soaps", icon: "🧼" },
    { id: "creams", name: "Creams", icon: "🧴" },
    { id: "scrubs", name: "Scrubs", icon: "✨" },
    { id: "oils", name: "Oils", icon: "💧" },
    { id: "hair-care", name: "Hair Care", icon: "💆‍♀️" },
  ];
}

// ============================================
// CLOUDINARY UPLOAD
// ============================================
export async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("cloud_name", CLOUDINARY_CLOUD);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
    method: "POST",
    body: formData
  });
  if (!res.ok) throw new Error("Cloudinary upload failed");
  const data = await res.json();
  return data.secure_url;
}

// ============================================
// CART (localStorage)
// ============================================
export function getCart() {
  try { return JSON.parse(localStorage.getItem("luxegreen_cart") || "[]"); } catch { return []; }
}

export function saveCart(cart) {
  localStorage.setItem("luxegreen_cart", JSON.stringify(cart));
  window.dispatchEvent(new Event("cartUpdated"));
}

export function addToCart(product, qty = 1) {
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === product.id);
  if (idx > -1) {
    cart[idx].qty += qty;
  } else {
    cart.push({ ...product, qty });
  }
  saveCart(cart);
}

export function removeFromCart(productId) {
  const cart = getCart().filter(i => i.id !== productId);
  saveCart(cart);
}

export function updateCartQty(productId, qty) {
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === productId);
  if (idx > -1) {
    if (qty <= 0) { cart.splice(idx, 1); }
    else { cart[idx].qty = qty; }
  }
  saveCart(cart);
}

export function getCartTotal() {
  return getCart().reduce((sum, i) => sum + (parseFloat(i.price) * i.qty), 0);
}

export function getCartCount() {
  return getCart().reduce((sum, i) => sum + i.qty, 0);
}

// ============================================
// WHATSAPP CHECKOUT
// ============================================
export function buildWhatsAppMessage(cart) {
  const items = cart.map(i => `• ${i.name} x${i.qty} — ₦${(parseFloat(i.price) * i.qty).toLocaleString()}`).join("\n");
  const total = getCartTotal();
  return encodeURIComponent(
    `🌿 *LuxeGreen Cosmetics Order*\n\n${items}\n\n*Total: ₦${total.toLocaleString()}*\n\nPlease confirm my order. Thank you!`
  );
}

export function openWhatsApp(cart) {
  const msg = buildWhatsAppMessage(cart);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
}

// ============================================
// TOAST NOTIFICATION
// ============================================
export function showToast(msg, type = "success") {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.className = `toast ${type}`;
  toast.innerHTML = `${type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"} ${msg}`;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3200);
}

// ============================================
// REVEAL ANIMATIONS
// ============================================
export function initReveal() {
  const els = document.querySelectorAll(".reveal");
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
}

// ============================================
// CAROUSEL FACTORY
// ============================================
export function initCarousel(trackEl, prevBtn, nextBtn, visibleCount = null) {
  let currentIndex = 0;
  const cards = trackEl.children;

  function getVisible() {
    if (visibleCount) return visibleCount;
    const w = window.innerWidth;
    if (w >= 1100) return 4;
    if (w >= 768) return 3;
    if (w >= 480) return 2;
    return 1;
  }

  function update() {
    const cardW = cards[0]?.offsetWidth + 20 || 0;
    const max = Math.max(0, cards.length - getVisible());
    currentIndex = Math.min(currentIndex, max);
    trackEl.style.transform = `translateX(-${currentIndex * cardW}px)`;
    if (prevBtn) prevBtn.style.opacity = currentIndex === 0 ? "0.4" : "1";
    if (nextBtn) nextBtn.style.opacity = currentIndex >= max ? "0.4" : "1";
  }

  if (prevBtn) prevBtn.addEventListener("click", () => { currentIndex = Math.max(0, currentIndex - 1); update(); });
  if (nextBtn) nextBtn.addEventListener("click", () => {
    const max = Math.max(0, cards.length - getVisible());
    currentIndex = Math.min(max, currentIndex + 1);
    update();
  });

  window.addEventListener("resize", update);
  setTimeout(update, 100);
  return { update, reset: () => { currentIndex = 0; update(); } };
}

// ============================================
// FORMAT CURRENCY
// ============================================
export function fmt(n) {
  return "₦" + parseFloat(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 0 });
}

// ============================================
// AUTH
// ============================================
export { signInWithEmailAndPassword, signOut, onAuthStateChanged };
