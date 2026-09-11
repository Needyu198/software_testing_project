import { useState, useRef, useEffect } from 'react';
import { isValidDiscountSubtotal, getPromotionPeriodError, getMinimumSpendError } from './discountValidation';
import { promotions, redeemDemoPromotion } from './promotions';
import { resolveCatalogProduct, getCatalogStock, isValidProductColor } from './stockValidation';
const PRODUCTS = [
    { id: 1, name: "Velocity Run Pro", category: "Running", gender: "Men's", price: 4590, colors: ["Black/White", "Grey/Blue", "Navy/White", "Red/Black"], rating: 4.8, reviews: 126, isNew: true, isSale: false, image: "photo-1637437757614-6491c8e915b5", description: "Built for serious runners, the Velocity Run Pro delivers elite performance with its energy-return foam midsole and engineered mesh upper. Lightweight and breathable, it adapts to your stride for a smooth, responsive feel every kilometer.", sizes: [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12], outOfStock: [7, 11] },
    { id: 2, name: "AeroRun Elite", category: "Running", gender: "Women's", price: 5290, colors: ["White/Pink", "Black/Teal", "Lavender"], rating: 4.7, reviews: 89, isNew: true, isSale: false, image: "photo-1625860191460-10a66c7384fb", description: "The AeroRun Elite is engineered for the female athlete. Its contoured fit and lightweight construction make every run feel effortless, from morning 5Ks to marathon training.", sizes: [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5], outOfStock: [6] },
    { id: 3, name: "Court Vision Pro", category: "Basketball", gender: "Men's", price: 5590, salePrice: 3990, colors: ["Black/White", "White/Gold"], rating: 4.6, reviews: 54, isNew: false, isSale: true, image: "photo-1469395446868-fb6a048d5ca3", description: "Dominate the court with the Court Vision Pro. Its high-top silhouette provides superior ankle support while the responsive cushioning keeps you explosive on every play.", sizes: [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12, 13], outOfStock: [13] },
    { id: 4, name: "Streetline 90", category: "Lifestyle", gender: "Men's", price: 3290, colors: ["White", "Black", "Cream/Gum", "Forest"], rating: 4.5, reviews: 203, isNew: false, isSale: false, image: "photo-1610664676282-55c8de64f746", description: "Classic silhouette meets modern comfort. The Streetline 90 is the everyday essential that pairs with anything in your wardrobe. Clean lines, premium materials, all-day wearability.", sizes: [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12], outOfStock: [] },
    { id: 5, name: "Motion Flex Trainer", category: "Training", gender: "Women's", price: 3290, salePrice: 2290, colors: ["Pink/White", "Black/White", "Mint"], rating: 4.4, reviews: 71, isNew: false, isSale: true, image: "photo-1604563906225-598785ab66ca", description: "From HIIT to yoga, the Motion Flex Trainer adapts to every workout. Its flexible sole and supportive midsole give you stability for lifting and agility for cardio.", sizes: [6, 6.5, 7, 7.5, 8, 8.5, 9], outOfStock: [6.5] },
    { id: 6, name: "Urban Step", category: "Lifestyle", gender: "Unisex", price: 2490, colors: ["White", "Black", "Olive", "Tan"], rating: 4.6, reviews: 158, isNew: true, isSale: false, image: "photo-1499692526241-33b38bd6c2df", description: "The Urban Step is your city companion. Minimal, clean, and comfortable — designed for streets, cafes, and everything in between.", sizes: [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12], outOfStock: [] },
    { id: 7, name: "TrailForce GTX", category: "Running", gender: "Men's", price: 6490, colors: ["Grey/Orange", "Black/Red"], rating: 4.9, reviews: 47, isNew: true, isSale: false, image: "photo-1611080027147-a1a0b6e05168", description: "Gore-Tex waterproof construction meets aggressive trail traction. The TrailForce GTX handles mud, roots, and rocks so you can focus on the run ahead.", sizes: [7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12], outOfStock: [12] },
    { id: 8, name: "Cloud Runner X", category: "Running", gender: "Women's", price: 4590, colors: ["White/Sky", "Rose/White", "Charcoal"], rating: 4.7, reviews: 93, isNew: false, isSale: false, image: "photo-1637437411360-b4607d62ddd3", description: "Ultra-lightweight cloud foam cushioning absorbs impact and returns energy with every step. The Cloud Runner X makes long distances feel shorter.", sizes: [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10], outOfStock: [] },
    { id: 9, name: "Elevate Basketball Pro", category: "Basketball", gender: "Men's", price: 5990, salePrice: 4290, colors: ["Red/Black", "White/Blue"], rating: 4.5, reviews: 38, isNew: false, isSale: true, image: "photo-1610664676996-84b489284b95", description: "Explosive cushioning and a lockdown fit make the Elevate Basketball Pro your edge on the hardwood. Full-length cushioning, wide base, maximum stability.", sizes: [8, 8.5, 9, 9.5, 10, 10.5, 11, 12, 13], outOfStock: [8] },
    { id: 10, name: "Everyday Classic", category: "Lifestyle", gender: "Women's", price: 2490, colors: ["White", "Blush", "Navy", "Black"], rating: 4.8, reviews: 312, isNew: false, isSale: false, image: "photo-1637437411826-bab0dc76a310", description: "Timeless silhouette, everyday comfort. The Everyday Classic is the shoe you will reach for again and again. Soft leather upper, cushioned insole, effortlessly versatile.", sizes: [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5], outOfStock: [] },
    { id: 11, name: "Sprint Zero", category: "Running", gender: "Men's", price: 3990, colors: ["Yellow/Black", "White/Black"], rating: 4.3, reviews: 61, isNew: false, isSale: false, image: "photo-1786379582231-f4a593cacf2d", description: "Speed-focused lightweight racer designed for tempo runs and race days. Stripped-back construction, incredible ground feel, and a snug sock-like fit.", sizes: [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5], outOfStock: [] },
    { id: 12, name: "Aero Trainer", category: "Training", gender: "Unisex", price: 2990, colors: ["Black", "White/Grey", "Blue"], rating: 4.5, reviews: 44, isNew: true, isSale: false, image: "photo-1676767720609-c76265fb3074", description: "Versatile cross-trainer built for gym sessions, classes, and active days. Stable base, breathable upper, and easy on/off design.", sizes: [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11], outOfStock: [6.5, 9.5] },
];
// Demo inventory is resolved by product, size and colour.
const getStock = (product, size, color) => getCatalogStock(product, size, PRODUCTS, color);
const imgUrl = (id, w = 600, h = 600) => `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;
function StarRating({ rating, size = 'sm' }) {
    const s = size === 'md' ? 'text-base' : 'text-xs';
    return (<span className={`${s} text-amber-400`}>
      {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
    </span>);
}
function Badge({ label, variant = 'dark' }) {
    const styles = {
        dark: 'bg-[#111] text-white',
        sale: 'bg-red-600 text-white',
        new: 'bg-[#111] text-white',
        success: 'bg-green-700 text-white',
        warning: 'bg-amber-500 text-white',
        error: 'bg-red-600 text-white',
    };
    return <span className={`inline-block px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase ${styles[variant]}`}>{label}</span>;
}
function ToastContainer({ toasts, dismiss }) {
    return (<div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map(t => {
            const bg = { success: 'bg-green-100 text-green-900 border border-green-200', error: 'bg-red-500 text-white', warning: 'bg-amber-500 text-white', info: 'bg-blue-600 text-white' };
            return (<div key={t.id} role={t.type === 'error' ? 'alert' : 'status'} className={`${bg[t.type]} rounded px-4 py-3 flex items-center gap-3 min-w-[280px] shadow-lg animate-slide-down`}>
            <span aria-hidden="true">{t.type === 'success' ? '✓' : '!'}</span><span className="flex-1 text-sm font-medium">{t.message}</span>
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss notification" className="opacity-70 hover:opacity-100 text-lg leading-none">&times;</button>
          </div>);
        })}
    </div>);
}
function ProductCard({ product, setPage, setSelectedProduct, addToWishlist }) {
    const discount = product.salePrice ? Math.round((1 - product.salePrice / product.price) * 100) : 0;
    return (<div className="product-card bg-white group cursor-pointer" onClick={() => { setSelectedProduct(product); setPage('product'); }}>
      <div className="relative overflow-hidden bg-[#F7F7F7] aspect-square">
        <img src={imgUrl(product.image)} alt={product.name} className="product-img w-full h-full object-cover transition-transform duration-500"/>
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.isNew && <Badge label="New" variant="new"/>}
          {product.isSale && <Badge label={`-${discount}%`} variant="sale"/>}
        </div>
        <button onClick={e => { e.stopPropagation(); addToWishlist(product); }} className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/80 hover:bg-white transition-colors text-[#111]" aria-label="Add to wishlist">
          ♡
        </button>
      </div>
      <div className="p-4">
        <p className="text-xs text-[#6B6B6B] uppercase tracking-wider mb-1">{product.gender} · {product.category}</p>
        <h3 className="font-display font-700 text-sm text-[#111] mb-1">{product.name}</h3>
        <p className="text-xs text-[#6B6B6B] mb-2">{product.colors.length} Colour{product.colors.length > 1 ? 's' : ''}</p>
        <div className="flex items-center gap-1 mb-2">
          <StarRating rating={product.rating}/>
          <span className="text-xs text-[#6B6B6B]">{product.rating} ({product.reviews})</span>
        </div>
        <div className="flex items-center gap-2">
          {product.salePrice ? (<>
              <span className="font-display font-bold text-[#111]">฿{product.salePrice.toLocaleString()}</span>
              <span className="text-sm text-[#6B6B6B] line-through">฿{product.price.toLocaleString()}</span>
            </>) : (<span className="font-display font-bold text-[#111]">฿{product.price.toLocaleString()}</span>)}
        </div>
      </div>
    </div>);
}
function AnnouncementBar() {
    return (<div className="bg-[#111] text-white text-center py-2.5 text-xs tracking-widest font-medium">
      FREE SHIPPING ON ORDERS OVER ฿2,500 &nbsp;·&nbsp; USE CODE <span className="font-bold">WELCOME10</span> FOR 10% OFF YOUR FIRST ORDER
    </div>);
}
function Header({ setPage, cartCount }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [megaMenu, setMegaMenu] = useState(null);
    const navLinks = ['New & Featured', 'Men', 'Women', 'Kids', 'Running', 'Lifestyle', 'Sale'];
    const megaItems = {
        'Men': [["Shoes", "Running", "Basketball", "Training", "Lifestyle", "Sale"], ["Clothing", "T-Shirts", "Shorts", "Jackets"], ["Accessories", "Bags", "Socks", "Caps"]],
        'Women': [["Shoes", "Running", "Training", "Lifestyle", "Basketball", "Sale"], ["Clothing", "Tops", "Shorts", "Leggings"], ["Accessories", "Bags", "Socks", "Caps"]],
        'Kids': [["Shoes", "Running", "Lifestyle", "Basketball"], ["Age", "4–7 years", "8–12 years", "13+ years"]],
    };
    const suggestions = searchQuery.length > 1
        ? PRODUCTS.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 4)
        : [];
    return (<>
      <header className="bg-white border-b border-[#E5E5E5] sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between gap-6">
          <button className="font-display text-xl font-extrabold tracking-tight text-[#111] cursor-pointer hover:opacity-70 transition-opacity" onClick={() => setPage('home')}>
            SOLEVA
          </button>
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map(link => (<div key={link} className="relative" onMouseEnter={() => megaItems[link] && setMegaMenu(link)} onMouseLeave={() => setMegaMenu(null)}>
                <button className={`text-sm font-medium hover:text-[#111] transition-colors pb-1 border-b-2 ${link === 'Sale' ? 'text-red-600 border-transparent' : 'text-[#6B6B6B] border-transparent hover:border-[#111]'}`} onClick={() => { if (link === 'Sale')
            setPage('sale');
        else
            setPage('shop'); }}>
                  {link}
                </button>
                {megaItems[link] && megaMenu === link && (<div className="absolute top-full left-0 bg-white border border-[#E5E5E5] shadow-xl p-6 flex gap-8 min-w-[400px] animate-slide-down z-50">
                    {megaItems[link].map((col, i) => (<div key={i}>
                        <p className="font-bold text-xs tracking-widest uppercase text-[#111] mb-3">{col[0]}</p>
                        {col.slice(1).map(item => (<button key={item} onClick={() => { setPage('shop'); setMegaMenu(null); }} className="block text-sm text-[#6B6B6B] hover:text-[#111] mb-2 transition-colors">{item}</button>))}
                      </div>))}
                  </div>)}
              </div>))}
          </nav>
          <div className="flex items-center gap-4">
            <button onClick={() => setSearchOpen(true)} className="text-[#6B6B6B] hover:text-[#111] transition-colors" aria-label="Search">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </button>
            <button onClick={() => setPage('account')} className="text-[#6B6B6B] hover:text-[#111] transition-colors hidden sm:block" aria-label="Account">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            </button>
            <button onClick={() => setPage('cart')} className="relative text-[#6B6B6B] hover:text-[#111] transition-colors" aria-label="Cart">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
              {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-[#111] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">{cartCount}</span>}
            </button>
            <button className="lg:hidden text-[#6B6B6B] hover:text-[#111]" onClick={() => setMenuOpen(!menuOpen)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
          </div>
        </div>
        {menuOpen && (<div className="lg:hidden bg-white border-t border-[#E5E5E5] px-6 py-4 flex flex-col gap-4">
            {navLinks.map(link => <button key={link} onClick={() => { setPage(link === 'Sale' ? 'sale' : 'shop'); setMenuOpen(false); }} className={`text-sm font-medium text-left ${link === 'Sale' ? 'text-red-600' : 'text-[#111]'}`}>{link}</button>)}
            <button onClick={() => { setPage('account'); setMenuOpen(false); }} className="text-sm font-medium text-left text-[#111]">Account</button>
          </div>)}
      </header>

      {searchOpen && (<div className="fixed inset-0 bg-white z-[60] animate-fade-in" onClick={() => setSearchOpen(false)}>
          <div className="max-w-2xl mx-auto px-6 pt-20" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 border-b-2 border-[#111] pb-3 mb-8">
              <svg className="w-5 h-5 text-[#6B6B6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search shoes, collections and categories" className="flex-1 text-lg text-[#111] placeholder-[#6B6B6B] bg-transparent"/>
              <button onClick={() => setSearchOpen(false)} className="text-[#6B6B6B] hover:text-[#111] text-2xl">&times;</button>
            </div>
            {searchQuery.length === 0 && (<div>
                <p className="text-xs font-bold tracking-widest uppercase text-[#6B6B6B] mb-4">Trending Searches</p>
                <div className="flex flex-wrap gap-2">
                  {['Running Shoes', 'White Sneakers', 'New Arrivals', 'Basketball', 'Sale'].map(t => (<button key={t} onClick={() => setSearchQuery(t)} className="border border-[#E5E5E5] px-4 py-2 text-sm text-[#111] hover:border-[#111] transition-colors">{t}</button>))}
                </div>
              </div>)}
            {suggestions.length > 0 && (<div>
                <p className="text-xs font-bold tracking-widest uppercase text-[#6B6B6B] mb-4">Suggestions</p>
                {suggestions.map(p => (<button key={p.id} onClick={() => { setSearchOpen(false); setSearchQuery(''); }} className="flex items-center gap-4 w-full py-3 border-b border-[#E5E5E5] hover:bg-[#F7F7F7] px-2 transition-colors">
                    <img src={imgUrl(p.image, 60, 60)} alt={p.name} className="w-12 h-12 object-cover bg-[#F7F7F7]"/>
                    <div className="text-left">
                      <p className="font-medium text-sm text-[#111]">{p.name}</p>
                      <p className="text-xs text-[#6B6B6B]">{p.gender} {p.category}</p>
                    </div>
                    <span className="ml-auto font-bold text-sm text-[#111]">฿{(p.salePrice ?? p.price).toLocaleString()}</span>
                  </button>))}
              </div>)}
            {searchQuery.length > 2 && suggestions.length === 0 && (<div className="text-center py-16">
                <p className="text-3xl font-display font-bold text-[#111] mb-3">No results found</p>
                <p className="text-[#6B6B6B] mb-6">Try checking the spelling or browse our collections.</p>
                <button onClick={() => { setSearchOpen(false); setPage('shop'); }} className="bg-[#111] text-white px-8 py-3 text-sm font-bold tracking-widest hover:bg-[#333] transition-colors">VIEW ALL SHOES</button>
              </div>)}
          </div>
        </div>)}
    </>);
}
function Footer({ setPage }) {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    return (<footer className="bg-[#111] text-white mt-auto">
      <div className="max-w-[1440px] mx-auto px-6 pt-16 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          <div>
            <p className="font-bold text-xs tracking-widest uppercase mb-5 text-white/50">Shop</p>
            {['Men', 'Women', 'Kids', 'New Arrivals', 'Sale'].map(l => <button key={l} onClick={() => setPage('shop')} className="block text-sm text-white/70 hover:text-white mb-3 transition-colors">{l}</button>)}
          </div>
          <div>
            <p className="font-bold text-xs tracking-widest uppercase mb-5 text-white/50">Help</p>
            {['Contact Us', 'Shipping', 'Returns', 'Size Guide', 'FAQs', 'Order Tracking'].map(l => <button key={l} className="block text-sm text-white/70 hover:text-white mb-3 transition-colors">{l}</button>)}
          </div>
          <div>
            <p className="font-bold text-xs tracking-widest uppercase mb-5 text-white/50">About SOLEVA</p>
            {['Our Story', 'Careers', 'Sustainability', 'Terms & Conditions', 'Privacy Policy'].map(l => <button key={l} className="block text-sm text-white/70 hover:text-white mb-3 transition-colors">{l}</button>)}
          </div>
          <div>
            <p className="font-bold text-xs tracking-widest uppercase mb-5 text-white/50">Follow Us</p>
            {['Instagram', 'Facebook', 'TikTok', 'YouTube'].map(l => <button key={l} className="block text-sm text-white/70 hover:text-white mb-3 transition-colors">{l}</button>)}
          </div>
        </div>
        <div className="border-t border-white/10 pt-10 mb-10">
          <div className="max-w-md">
            <p className="font-display text-xl font-bold mb-2">Stay One Step Ahead</p>
            <p className="text-white/60 text-sm mb-5">Sign up for new releases, exclusive offers, and member-only promotions.</p>
            {subscribed ? (<p className="text-green-400 text-sm font-medium">Thanks for subscribing! Check your inbox soon.</p>) : (<form onSubmit={e => { e.preventDefault(); setSubscribed(true); }} className="flex gap-2">
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email address" className="flex-1 bg-white/10 border border-white/20 text-white placeholder-white/40 px-4 py-2.5 text-sm focus:border-white transition-colors"/>
                <button type="submit" className="bg-white text-[#111] px-6 py-2.5 text-xs font-bold tracking-widest hover:bg-white/90 transition-colors">SIGN UP</button>
              </form>)}
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="font-display text-2xl font-extrabold">SOLEVA</p>
          <p className="text-white/40 text-xs">© 2026 SOLEVA. All rights reserved. &nbsp;·&nbsp; Thailand | English</p>
          <div className="flex gap-2">
            {['VISA', 'MC', 'AMEX', 'PP'].map(c => <span key={c} className="border border-white/20 px-2 py-1 text-[10px] font-bold text-white/60">{c}</span>)}
          </div>
        </div>
      </div>
    </footer>);
}
function HomePage({ setPage, addToCart, setSelectedProduct, addToWishlist }) {
    const newArrivals = PRODUCTS.filter(p => p.isNew);
    const bestSellers = PRODUCTS.filter(p => p.reviews > 80).slice(0, 4);
    const categories = [
        { name: 'Running', image: 'photo-1637437757614-6491c8e915b5' },
        { name: 'Lifestyle', image: 'photo-1499692526241-33b38bd6c2df' },
        { name: 'Basketball', image: 'photo-1469395446868-fb6a048d5ca3' },
        { name: 'Training', image: 'photo-1604563906225-598785ab66ca' },
        { name: 'Football', image: 'photo-1611080027147-a1a0b6e05168' },
        { name: 'Sandals', image: 'photo-1610664676282-55c8de64f746' },
    ];
    return (<div>
      {/* Hero */}
      <section className="relative bg-[#111] min-h-[85vh] flex items-center overflow-hidden">
        <img src={`https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1440&h=900&fit=crop&auto=format&q=80`} alt="SOLEVA Hero" className="absolute inset-0 w-full h-full object-cover opacity-50"/>
        <div className="relative z-10 max-w-[1440px] mx-auto px-6 py-24">
          <p className="text-white/60 text-xs font-bold tracking-[0.3em] uppercase mb-6">New Season 2026</p>
          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-extrabold text-white leading-none mb-6 max-w-3xl">STEP INTO YOUR NEXT MOVE</h1>
          <p className="text-white/70 text-lg mb-10 max-w-md">Performance. Comfort. Everyday Style.</p>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => setPage('shop')} className="bg-white text-[#111] px-8 py-4 text-sm font-bold tracking-widest hover:bg-white/90 transition-colors">SHOP MEN</button>
            <button onClick={() => setPage('shop')} className="border-2 border-white text-white px-8 py-4 text-sm font-bold tracking-widest hover:bg-white hover:text-[#111] transition-colors">SHOP WOMEN</button>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="max-w-[1440px] mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <h2 className="font-display text-3xl font-extrabold text-[#111]">New Arrivals</h2>
          <button onClick={() => setPage('shop')} className="text-sm font-medium text-[#6B6B6B] hover:text-[#111] underline underline-offset-4 transition-colors">View All</button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {newArrivals.slice(0, 4).map(p => <ProductCard key={p.id} product={p} setPage={setPage} setSelectedProduct={setSelectedProduct} addToWishlist={addToWishlist}/>)}
        </div>
      </section>

      {/* Shop by Category */}
      <section className="max-w-[1440px] mx-auto px-6 py-10">
        <h2 className="font-display text-3xl font-extrabold text-[#111] mb-10">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map(c => (<button key={c.name} onClick={() => setPage('shop')} className="group relative aspect-square overflow-hidden bg-[#F7F7F7]">
              <img src={imgUrl(c.image, 400, 400)} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"/>
              <div className="absolute inset-0 bg-gradient-to-t from-[#111]/70 to-transparent"/>
              <p className="absolute bottom-3 left-0 right-0 text-center text-white font-display font-bold text-sm">{c.name}</p>
            </button>))}
        </div>
      </section>

      {/* Trending Now */}
      <section className="max-w-[1440px] mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <h2 className="font-display text-3xl font-extrabold text-[#111]">Trending Now</h2>
          <button onClick={() => setPage('shop')} className="text-sm font-medium text-[#6B6B6B] hover:text-[#111] underline underline-offset-4">View All</button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {PRODUCTS.slice(4, 8).map(p => <ProductCard key={p.id} product={p} setPage={setPage} setSelectedProduct={setSelectedProduct} addToWishlist={addToWishlist}/>)}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="bg-[#111] py-24 text-center relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1611080027147-a1a0b6e05168?w=1440&h=400&fit=crop&auto=format&q=80" alt="" className="absolute inset-0 w-full h-full object-cover opacity-20"/>
        <div className="relative z-10">
          <p className="text-white/50 text-xs font-bold tracking-[0.3em] uppercase mb-3">Limited Time</p>
          <h2 className="font-display text-5xl sm:text-7xl font-extrabold text-white mb-3">MID-SEASON SALE</h2>
          <p className="text-red-400 text-4xl font-display font-extrabold mb-8">UP TO 40% OFF</p>
          <button onClick={() => setPage('sale')} className="bg-white text-[#111] px-10 py-4 text-sm font-bold tracking-widest hover:bg-white/90 transition-colors">SHOP SALE</button>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="max-w-[1440px] mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <h2 className="font-display text-3xl font-extrabold text-[#111]">Best Sellers</h2>
          <button onClick={() => setPage('shop')} className="text-sm font-medium text-[#6B6B6B] hover:text-[#111] underline underline-offset-4">View All</button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {bestSellers.map(p => <ProductCard key={p.id} product={p} setPage={setPage} setSelectedProduct={setSelectedProduct} addToWishlist={addToWishlist}/>)}
        </div>
      </section>

      {/* Collections */}
      <section className="max-w-[1440px] mx-auto px-6 py-10 pb-20">
        <h2 className="font-display text-3xl font-extrabold text-[#111] mb-10">Shop by Collection</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: "Everyday Essentials", image: "photo-1610664676282-55c8de64f746" },
            { name: "Performance Running", image: "photo-1637437757614-6491c8e915b5" },
            { name: "Street Style", image: "photo-1499692526241-33b38bd6c2df" },
            { name: "Court Collection", image: "photo-1469395446868-fb6a048d5ca3" },
        ].map(c => (<button key={c.name} onClick={() => setPage('shop')} className="group relative aspect-[3/4] overflow-hidden bg-[#F7F7F7]">
              <img src={imgUrl(c.image, 400, 500)} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
              <div className="absolute inset-0 bg-gradient-to-t from-[#111]/80 via-transparent to-transparent"/>
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-white font-display font-extrabold text-lg leading-tight">{c.name}</p>
                <p className="text-white/60 text-xs mt-1 group-hover:text-white transition-colors">Explore →</p>
              </div>
            </button>))}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-white border-t border-b border-[#E5E5E5]">
        <div className="max-w-[1440px] mx-auto px-6 py-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: '🚚', title: 'Free Shipping', text: 'Free delivery on orders over ฿2,500' },
            { icon: '↩️', title: 'Easy Returns', text: '30-day hassle-free return policy' },
            { icon: '🔒', title: 'Secure Payment', text: 'Your data is always protected' },
            { icon: '💬', title: 'Customer Support', text: 'Available 7 days a week' },
        ].map(b => (<div key={b.title} className="flex flex-col items-center text-center gap-3">
              <span className="text-3xl">{b.icon}</span>
              <p className="font-display font-bold text-[#111]">{b.title}</p>
              <p className="text-sm text-[#6B6B6B]">{b.text}</p>
            </div>))}
        </div>
      </section>
    </div>);
}
function ShopPage({ setPage, addToCart, setSelectedProduct, addToWishlist }) {
    const [sort, setSort] = useState('Featured');
    const [filters, setFilters] = useState({ gender: [], category: [], onSale: false, inStock: false });
    const [priceRange, setPriceRange] = useState(10000);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const toggleFilter = (key, val) => {
        setFilters(prev => ({
            ...prev,
            [key]: prev[key].includes(val) ? prev[key].filter(v => v !== val) : [...prev[key], val]
        }));
    };
    let filtered = PRODUCTS.filter(p => {
        if (filters.gender.length && !filters.gender.some(g => p.gender.includes(g) || (g === 'Unisex' && p.gender === 'Unisex')))
            return false;
        if (filters.category.length && !filters.category.includes(p.category))
            return false;
        if (filters.onSale && !p.isSale)
            return false;
        if ((p.salePrice ?? p.price) > priceRange)
            return false;
        return true;
    });
    if (sort === 'Price: Low to High')
        filtered = [...filtered].sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
    else if (sort === 'Price: High to Low')
        filtered = [...filtered].sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
    else if (sort === 'Customer Rating')
        filtered = [...filtered].sort((a, b) => b.rating - a.rating);
    else if (sort === 'Best Selling')
        filtered = [...filtered].sort((a, b) => b.reviews - a.reviews);
    const clearFilters = () => { setFilters({ gender: [], category: [], onSale: false, inStock: false }); setPriceRange(10000); };
    return (<div className="max-w-[1440px] mx-auto px-6 py-8">
      <div className="text-xs text-[#6B6B6B] mb-4">Home / Men / Shoes</div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-[#111]">All Shoes</h1>
          <p className="text-[#6B6B6B] text-sm mt-1">{filtered.length} Products</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="lg:hidden border border-[#E5E5E5] px-4 py-2 text-sm font-medium flex items-center gap-2 hover:border-[#111] transition-colors" onClick={() => setFiltersOpen(!filtersOpen)}>
            Filter {filtersOpen ? '▲' : '▼'}
          </button>
          <select value={sort} onChange={e => setSort(e.target.value)} className="border border-[#E5E5E5] px-3 py-2 text-sm focus:border-[#111] transition-colors bg-white">
            {['Featured', 'Newest', 'Best Selling', 'Price: Low to High', 'Price: High to Low', 'Customer Rating'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className={`${filtersOpen ? 'block' : 'hidden'} lg:block w-full lg:w-60 flex-shrink-0`}>
          <div className="flex items-center justify-between mb-6">
            <p className="font-bold text-sm tracking-widest uppercase">Filters</p>
            <button onClick={clearFilters} className="text-xs text-[#6B6B6B] hover:text-[#111] underline transition-colors">CLEAR FILTERS</button>
          </div>

          {[
            { label: 'Gender', key: 'gender', options: ["Men's", "Women's", "Unisex", "Kids"] },
            { label: 'Category', key: 'category', options: ["Running", "Lifestyle", "Basketball", "Training", "Football", "Sandals"] },
        ].map(group => (<div key={group.label} className="mb-6 border-b border-[#E5E5E5] pb-6">
              <p className="font-bold text-xs tracking-widest uppercase mb-4">{group.label}</p>
              {group.options.map(opt => (<label key={opt} className="flex items-center gap-2.5 mb-2.5 cursor-pointer group">
                  <input type="checkbox" checked={filters[group.key].includes(opt)} onChange={() => toggleFilter(group.key, opt)} className="w-4 h-4 accent-[#111]"/>
                  <span className="text-sm text-[#6B6B6B] group-hover:text-[#111] transition-colors">{opt}</span>
                </label>))}
            </div>))}

          <div className="mb-6 border-b border-[#E5E5E5] pb-6">
            <p className="font-bold text-xs tracking-widest uppercase mb-4">Price</p>
            <div className="flex justify-between text-sm text-[#6B6B6B] mb-2">
              <span>฿0</span><span>฿{priceRange.toLocaleString()}</span>
            </div>
            <input type="range" min={0} max={10000} step={500} value={priceRange} onChange={e => setPriceRange(Number(e.target.value))} className="w-full accent-[#111]"/>
          </div>

          <div className="mb-6 pb-6">
            <p className="font-bold text-xs tracking-widest uppercase mb-4">Availability</p>
            <label className="flex items-center gap-2.5 mb-2.5 cursor-pointer">
              <input type="checkbox" checked={filters.onSale} onChange={() => setFilters(f => ({ ...f, onSale: !f.onSale }))} className="w-4 h-4 accent-[#111]"/>
              <span className="text-sm text-[#6B6B6B]">On Sale</span>
            </label>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {filtered.length === 0 ? (<div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="text-6xl mb-6">👟</div>
              <h3 className="font-display text-2xl font-bold text-[#111] mb-3">No products found</h3>
              <p className="text-[#6B6B6B] mb-6">Try adjusting your filters to find what you are looking for.</p>
              <button onClick={clearFilters} className="bg-[#111] text-white px-8 py-3 text-sm font-bold tracking-widest hover:bg-[#333] transition-colors">CLEAR FILTERS</button>
            </div>) : (<div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(p => <ProductCard key={p.id} product={p} setPage={setPage} setSelectedProduct={setSelectedProduct} addToWishlist={addToWishlist}/>)}
            </div>)}
        </div>
      </div>
    </div>);
}
function ProductDetailPage({ product, setPage, addToCart, addToWishlist }) {
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(product.colors[0]);
    const [sizeError, setSizeError] = useState(false);
    const [activeImage, setActiveImage] = useState(0);
    const [openAccordion, setOpenAccordion] = useState('Description');
    const [adding, setAdding] = useState(false);
    const images = [product.image, 'photo-1637437411360-b4607d62ddd3', 'photo-1786379582231-f4a593cacf2d', 'photo-1625860191460-10a66c7384fb', 'photo-1499692526241-33b38bd6c2df'];
    const reviews = [
        { name: "James T.", rating: 5, title: "Excellent everyday running shoes", body: "Very comfortable and lightweight. Perfect for my morning runs. Highly recommend!", date: "12 Aug 2026", verified: true },
        { name: "Sunisa K.", rating: 4, title: "Great fit, runs slightly narrow", body: "Love the style and the cushioning is great. I suggest going half a size up if you have wide feet.", date: "3 Aug 2026", verified: true },
        { name: "Marco L.", rating: 5, title: "Best running shoes I've owned", body: "The energy return is incredible. I set a new PB wearing these shoes. Worth every baht.", date: "27 Jul 2026", verified: true },
    ];
    const handleAddToBag = () => {
        if (!selectedSize) {
            setSizeError(true);
            return;
        }
        setAdding(true);
        setTimeout(() => {
            addToCart(product, selectedSize, selectedColor);
            setAdding(false);
        }, 800);
    };
    const accordions = [
        { title: 'Product Description', content: product.description },
        { title: 'Product Details', content: `Upper: Premium engineered mesh\nMidsole: Energy-return foam\nOutsole: High-traction rubber\nWeight: 285g (Size 9)\nDrop: 10mm` },
        { title: 'Size & Fit', content: "This model fits true to size. We recommend ordering your regular size. For wider feet, consider going up half a size." },
        { title: 'Shipping & Returns', content: "Free standard shipping on orders over ฿2,500. Express delivery available for ฿150. Returns accepted within 30 days of delivery in original condition." },
        { title: 'Materials & Care', content: "Upper: Engineered mesh 60%, synthetic 40%. Wipe clean with a damp cloth. Do not machine wash. Air dry only." },
    ];
    const discount = product.salePrice ? Math.round((1 - product.salePrice / product.price) * 100) : 0;
    return (<div className="max-w-[1440px] mx-auto px-6 py-8">
      <div className="text-xs text-[#6B6B6B] mb-6">
        <button onClick={() => setPage('home')} className="hover:text-[#111]">Home</button> / <button onClick={() => setPage('shop')} className="hover:text-[#111]">Men</button> / <button onClick={() => setPage('shop')} className="hover:text-[#111]">Running</button> / {product.name}
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Gallery */}
        <div className="flex gap-3">
          <div className="flex flex-col gap-2 w-16">
            {images.map((img, i) => (<button key={i} onClick={() => setActiveImage(i)} className={`aspect-square overflow-hidden bg-[#F7F7F7] border-2 transition-colors ${activeImage === i ? 'border-[#111]' : 'border-transparent hover:border-[#E5E5E5]'}`}>
                <img src={imgUrl(img, 80, 80)} alt="" className="w-full h-full object-cover"/>
              </button>))}
          </div>
          <div className="flex-1 bg-[#F7F7F7] aspect-square overflow-hidden">
            <img src={imgUrl(images[activeImage], 700, 700)} alt={product.name} className="w-full h-full object-cover"/>
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="flex items-start gap-2 mb-1">
            {product.isNew && <Badge label="New" variant="new"/>}
            {product.isSale && <Badge label={`-${discount}%`} variant="sale"/>}
          </div>
          <h1 className="font-display text-3xl font-extrabold text-[#111] mb-1">{product.name}</h1>
          <p className="text-[#6B6B6B] text-sm mb-3">{product.gender} {product.category} Shoes</p>
          <div className="flex items-center gap-2 mb-4">
            <StarRating rating={product.rating} size="md"/>
            <button className="text-sm text-[#6B6B6B] hover:text-[#111] underline">{product.rating} ({product.reviews} Reviews)</button>
          </div>
          <div className="flex items-center gap-3 mb-6">
            {product.salePrice ? (<>
                <span className="font-display text-2xl font-extrabold text-[#111]">฿{product.salePrice.toLocaleString()}</span>
                <span className="text-lg text-[#6B6B6B] line-through">฿{product.price.toLocaleString()}</span>
              </>) : (<span className="font-display text-2xl font-extrabold text-[#111]">฿{product.price.toLocaleString()}</span>)}
          </div>

          {/* Color */}
          <div className="mb-5">
            <p className="text-sm font-bold mb-3">Color: <span className="font-normal text-[#6B6B6B]">{selectedColor}</span></p>
            <div className="flex gap-2 flex-wrap">
              {product.colors.map(c => (<button key={c} onClick={() => setSelectedColor(c)} className={`px-3 py-1.5 text-xs border transition-colors ${selectedColor === c ? 'border-[#111] bg-[#111] text-white' : 'border-[#E5E5E5] text-[#111] hover:border-[#111]'}`}>{c}</button>))}
            </div>
          </div>

          {/* Size */}
          <div className={`mb-5 p-4 ${sizeError ? 'border-2 border-red-500 bg-red-50' : 'border border-[#E5E5E5]'}`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold">Select Size</p>
              <button className="text-xs text-[#6B6B6B] underline hover:text-[#111]">Size Guide</button>
            </div>
            {sizeError && <p className="text-red-600 text-sm mb-3 font-medium">Please select a size before adding this item to your bag.</p>}
            <div className="flex flex-wrap gap-2">
              {product.sizes.map(s => {
            const oos = getStock(product, s, selectedColor) === 0;
            return (<button key={s} disabled={oos} onClick={() => { setSelectedSize(s); setSizeError(false); }} className={`w-14 py-2 text-sm border transition-colors ${oos ? 'border-[#E5E5E5] text-[#C5C5C5] line-through cursor-not-allowed' : selectedSize === s ? 'border-[#111] bg-[#111] text-white' : 'border-[#E5E5E5] hover:border-[#111] text-[#111]'}`}>
                    {s}
                  </button>);
        })}
            </div>
          </div>

          {/* Stock warning */}
          <p role="status" className="text-xs font-medium mb-5 min-h-5">
            {selectedSize === null ? <span className="text-[#6B6B6B]">Select a size to check availability</span> : <><span className={getStock(product, selectedSize, selectedColor) > 0 ? "text-green-700" : "text-red-600"}>{getStock(product, selectedSize, selectedColor) > 0 ? "● In Stock" : "Out of Stock"}</span> {getStock(product, selectedSize, selectedColor) > 0 && <span className="text-orange-700">({getStock(product, selectedSize, selectedColor)} left in this size)</span>}</>}
          </p>

          {/* Actions */}
          <div className="flex gap-3 mb-6">
            <button onClick={handleAddToBag} disabled={adding} className="flex-1 bg-[#111] text-white py-4 text-sm font-bold tracking-widest hover:bg-[#333] transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
              {adding ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> ADDING...</> : 'ADD TO BAG'}
            </button>
            <button onClick={() => addToWishlist(product)} className="border border-[#E5E5E5] px-4 py-4 text-sm hover:border-[#111] transition-colors text-[#111]">♡</button>
          </div>

          {/* Benefits */}
          <div className="border-t border-[#E5E5E5] pt-5 flex flex-col gap-2">
            {['Free delivery on orders over ฿2,500', '30-day easy returns', 'Secure checkout'].map(b => (<div key={b} className="flex items-center gap-2 text-sm text-[#6B6B6B]">
                <span className="text-green-600">✓</span> {b}
              </div>))}
          </div>

          {/* Accordions */}
          <div className="mt-6 border-t border-[#E5E5E5]">
            {accordions.map(a => (<div key={a.title} className="border-b border-[#E5E5E5]">
                <button onClick={() => setOpenAccordion(openAccordion === a.title ? null : a.title)} className="flex items-center justify-between w-full py-4 text-sm font-bold text-[#111] text-left">
                  {a.title}
                  <span className="text-[#6B6B6B]">{openAccordion === a.title ? '−' : '+'}</span>
                </button>
                {openAccordion === a.title && (<div className="pb-4 text-sm text-[#6B6B6B] whitespace-pre-line leading-relaxed">{a.content}</div>)}
              </div>))}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-20 border-t border-[#E5E5E5] pt-16">
        <div className="grid lg:grid-cols-3 gap-12">
          <div>
            <h3 className="font-display text-2xl font-extrabold text-[#111] mb-6">Customer Reviews</h3>
            <div className="text-5xl font-display font-extrabold text-[#111] mb-2">{product.rating} <span className="text-2xl text-[#6B6B6B]">/ 5</span></div>
            <StarRating rating={product.rating} size="md"/>
            <p className="text-sm text-[#6B6B6B] mt-2 mb-6">{product.reviews} Reviews</p>
            {[5, 4, 3, 2, 1].map(n => {
            const pcts = { 5: 82, 4: 12, 3: 4, 2: 1, 1: 1 };
            return (<div key={n} className="flex items-center gap-3 mb-2">
                  <span className="text-xs w-10">{n} ★</span>
                  <div className="flex-1 h-2 bg-[#E5E5E5] overflow-hidden">
                    <div className="h-full bg-amber-400 transition-all" style={{ width: `${pcts[n]}%` }}/>
                  </div>
                  <span className="text-xs text-[#6B6B6B] w-8">{pcts[n]}%</span>
                </div>);
        })}
            <button className="mt-6 border border-[#111] text-[#111] px-6 py-3 text-xs font-bold tracking-widest hover:bg-[#111] hover:text-white transition-colors w-full">WRITE A REVIEW</button>
          </div>
          <div className="lg:col-span-2 flex flex-col gap-6">
            {reviews.map((r, i) => (<div key={i} className="bg-white p-6 border border-[#E5E5E5]">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <StarRating rating={r.rating}/>
                    <h4 className="font-bold text-[#111] mt-1">{r.title}</h4>
                  </div>
                  <span className="text-xs text-[#6B6B6B]">{r.date}</span>
                </div>
                <p className="text-sm text-[#6B6B6B] mb-3">{r.body}</p>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-[#111]">{r.name}</span>
                  {r.verified && <Badge label="Verified Buyer" variant="success"/>}
                </div>
              </div>))}
          </div>
        </div>
      </section>
    </div>);
}
function CartPage({ cart, setPage, updateQty, removeFromCart, showToast, redemptionSession }) {
    const [promo, setPromo] = useState('');
    const [promoApplied, setPromoApplied] = useState(null);
    const [promoError, setPromoError] = useState('');
    const subtotal = cart.reduce((s, item) => s + (item.product.salePrice ?? item.product.price) * item.quantity, 0);
    const subtotalValid = isValidDiscountSubtotal(cart, subtotal);
    const appliedPromotion = promotions.find(item => item.code === promoApplied);
    const minimumSpendError = appliedPromotion ? getMinimumSpendError(appliedPromotion, subtotal) : '';
    const displayedPromoError = promoError || minimumSpendError;
    const promoEligible = Boolean(promoApplied) && subtotalValid && !minimumSpendError;
    const discount = promoEligible && promoApplied === 'WELCOME10' ? Math.round(subtotal * 0.1) : 0;
    const shipping = subtotal >= 2500 ? 0 : 150;
    const total = subtotal - discount + shipping;
    const applyPromo = () => {
        if (!subtotalValid) {
            setPromoApplied(null);
            setPromoError('Invalid order subtotal. Please check your cart before applying a discount.');
            return;
        }
        const code = promo.trim().toUpperCase();
        const promotion = promotions.find(item => item.code === code);
        if (!promotion) {
            setPromoApplied(null);
            setPromoError('Invalid discount code. Please try again.');
            return;
        }
        if (promotion.status !== 'Active') {
            setPromoApplied(null);
            setPromoError('This discount code is inactive.');
            return;
        }
        const periodError = getPromotionPeriodError(promotion);
        if (periodError) {
            setPromoApplied(null);
            setPromoError(periodError);
            return;
        }
        const minimumError = getMinimumSpendError(promotion, subtotal);
        if (minimumError) {
            setPromoApplied(null);
            setPromoError(minimumError);
            return;
        }
        if (code === 'WELCOME10') {
            const redemptionError = redeemDemoPromotion(promotion, redemptionSession);
            if (redemptionError) {
                setPromoApplied(null);
                setPromoError(redemptionError);
                return;
            }
            setPromoApplied('WELCOME10');
            setPromo('WELCOME10');
            setPromoError('');
        }
        else {
            setPromoError('Invalid discount code. Please try again.');
            setPromoApplied(null);
        }
    };
    if (cart.length === 0) {
        return (<div className="max-w-[1440px] mx-auto px-6 py-20 flex flex-col items-center text-center">
        <div className="w-24 h-24 border-2 border-[#E5E5E5] flex items-center justify-center mb-8">
          <svg className="w-10 h-10 text-[#C5C5C5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
        </div>
        <h2 className="font-display text-3xl font-extrabold text-[#111] mb-3">Your bag is empty</h2>
        <p className="text-[#6B6B6B] mb-8">Looks like you haven't added anything yet.</p>
        <button onClick={() => setPage('shop')} className="bg-[#111] text-white px-10 py-4 text-sm font-bold tracking-widest hover:bg-[#333] transition-colors">START SHOPPING</button>
        <div className="mt-16 w-full">
          <h3 className="font-display text-xl font-bold text-[#111] mb-6">You might like</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {PRODUCTS.slice(0, 4).map(p => (<div key={p.id} className="bg-white cursor-pointer" onClick={() => setPage('shop')}>
                <img src={imgUrl(p.image, 400, 400)} alt={p.name} className="w-full aspect-square object-cover bg-[#F7F7F7]"/>
                <div className="p-3">
                  <p className="font-bold text-sm">{p.name}</p>
                  <p className="text-[#6B6B6B] text-sm">฿{(p.salePrice ?? p.price).toLocaleString()}</p>
                </div>
              </div>))}
          </div>
        </div>
      </div>);
    }
    return (<div className="max-w-[1440px] mx-auto px-6 py-10">
      <h1 className="font-display text-3xl font-extrabold text-[#111] mb-2">YOUR BAG</h1>
      <p className="text-[#6B6B6B] text-sm mb-10">{cart.length} ITEM{cart.length > 1 ? 'S' : ''}</p>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 flex flex-col gap-4">
          {cart.map((item, idx) => (<div key={idx} className="bg-white p-5 flex gap-4">
              <img src={imgUrl(item.product.image, 120, 120)} alt={item.product.name} className="w-24 h-24 object-cover bg-[#F7F7F7] flex-shrink-0"/>
              <div className="flex-1">
                <div className="flex justify-between">
                  <div>
                    <p className="font-bold text-[#111]">{item.product.name}</p>
                    <p className="text-sm text-[#6B6B6B]">{item.color} · Size {item.size}</p>
                  </div>
                  <p className="font-bold text-[#111]">฿{((item.product.salePrice ?? item.product.price) * item.quantity).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center border border-[#E5E5E5]">
                    <button aria-label={`Decrease quantity of ${item.product.name}`} disabled={item.quantity <= 1} onClick={() => updateQty(idx, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-lg hover:bg-[#F7F7F7] transition-colors">−</button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button aria-label={`Increase quantity of ${item.product.name}`} onClick={() => updateQty(idx, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-lg hover:bg-[#F7F7F7] transition-colors">+</button>
                  </div>
                  <button onClick={() => removeFromCart(idx)} className="text-xs text-[#6B6B6B] hover:text-red-600 underline transition-colors">Remove</button>
                  <button onClick={() => { removeFromCart(idx); showToast('Wishlist updated.', 'success'); }} className="text-xs text-[#6B6B6B] hover:text-[#111] underline transition-colors">Move to Wishlist</button>
                </div>
                <p className="text-orange-700 text-xs mt-3" role="status">⚠ Only {getStock(item.product, item.size, item.color)} left in stock</p>
              </div>
            </div>))}
        </div>

        {/* Order Summary */}
        <div className="bg-white p-6 h-fit">
          <h3 className="font-display font-bold text-lg text-[#111] mb-6">Order Summary</h3>
          <div className="flex flex-col gap-3 mb-6 text-sm">
            <div className="flex justify-between"><span className="text-[#6B6B6B]">Subtotal</span><span className="font-medium">฿{subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-[#6B6B6B]">Shipping</span><span className="font-medium">{shipping === 0 ? 'FREE' : `฿${shipping}`}</span></div>
            {discount > 0 && <div className="flex justify-between items-center gap-2 text-green-700"><span>Discount (WELCOME10)</span><span className="ml-auto">−฿{discount.toLocaleString()}</span><button aria-label="Remove discount" onClick={() => { setPromoApplied(null); setPromo(''); setPromoError(''); }} className="px-1">×</button></div>}
            <div className="border-t border-[#E5E5E5] pt-3 flex justify-between text-base font-display font-extrabold text-[#111]"><span>Estimated Total</span><span>฿{total.toLocaleString()}</span></div>
          </div>

          <div className="mb-5">
            <div className="flex gap-2">
              <input value={promo} onChange={e => { setPromo(e.target.value); setPromoError(''); }} onKeyDown={e => { if (e.key === 'Enter') applyPromo(); }} aria-label="Promo code" aria-invalid={Boolean(displayedPromoError)} aria-describedby={displayedPromoError ? 'promo-error' : undefined} placeholder="Enter promo code" className={`min-w-0 flex-1 border ${promoEligible ? 'border-green-300' : 'border-[#E5E5E5]'} px-3 py-2.5 text-sm focus:border-[#111] transition-colors`}/>
              <button onClick={applyPromo} className="bg-[#111] text-white px-4 py-2.5 text-xs font-bold tracking-widest hover:bg-[#333] transition-colors">APPLY</button>
            </div>
            {promoEligible && <p className="text-green-700 text-xs mt-2 font-medium">✓ WELCOME10 applied — 10% OFF</p>}
            {displayedPromoError && <p id="promo-error" role="alert" className="text-red-600 text-xs mt-2">⚠ {displayedPromoError}</p>}
          </div>

          <button onClick={() => setPage('checkout')} className="w-full bg-[#111] text-white py-4 text-sm font-bold tracking-widest hover:bg-[#333] transition-colors mb-3">CHECKOUT</button>
          <button onClick={() => setPage('shop')} className="w-full border border-[#E5E5E5] py-4 text-sm font-medium hover:border-[#111] transition-colors">CONTINUE SHOPPING</button>
        </div>
      </div>
    </div>);
}
function CheckoutPage({ setPage, cartTotal }) {
    const [step, setStep] = useState(1);
    const [delivery, setDelivery] = useState('standard');
    const [payment, setPayment] = useState('card');
    const [processing, setProcessing] = useState(false);
    const [payFailed, setPayFailed] = useState(false);
    const [form, setForm] = useState({ email: '', first: '', last: '', phone: '', address: '', apt: '', district: '', province: '', postal: '', country: 'Thailand' });
    const [errors, setErrors] = useState({});
    const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
    const [cardErrors, setCardErrors] = useState({});
    const steps = ['Information', 'Delivery', 'Payment', 'Review'];
    const shipping = delivery === 'express' ? 150 : 0;
    const total = cartTotal + shipping;
    const validateInfo = () => {
        const e = {};
        if (!form.email.match(/^[^@]+@[^@]+\.[^@]+$/))
            e.email = 'Please enter a valid email address.';
        if (!form.first.trim())
            e.first = 'First name is required.';
        if (!form.last.trim())
            e.last = 'Last name is required.';
        if (!form.address.trim())
            e.address = 'Address is required.';
        if (!form.postal.match(/^\d{5}$/))
            e.postal = 'Please enter a valid 5-digit postal code.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };
    const validateCard = () => {
        const e = {};
        if (card.number.replace(/\s/g, '').length < 16)
            e.number = 'Please enter a valid card number.';
        if (!card.expiry.match(/^\d{2}\/\d{2}$/))
            e.expiry = 'Please enter a valid expiration date.';
        if (!card.cvv.match(/^\d{3}$/))
            e.cvv = 'CVV must contain 3 digits.';
        if (!card.name.trim())
            e.name = 'Name on card is required.';
        setCardErrors(e);
        return Object.keys(e).length === 0;
    };
    const handlePlaceOrder = () => {
        setProcessing(true);
        setTimeout(() => {
            setProcessing(false);
            setPage('confirmation');
        }, 2500);
    };
    const fld = (label, key, placeholder = '') => (<div>
      <label className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] block mb-1">{label}</label>
      <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} className={`w-full border px-4 py-3 text-sm focus:border-[#111] transition-colors ${errors[key] ? 'border-red-500 bg-red-50' : 'border-[#E5E5E5]'}`}/>
      {errors[key] && <p className="text-red-600 text-xs mt-1">{errors[key]}</p>}
    </div>);
    if (processing) {
        return (<div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <div className="w-12 h-12 border-4 border-[#E5E5E5] border-t-[#111] rounded-full animate-spin"/>
        <h2 className="font-display text-2xl font-bold text-[#111]">Processing your payment...</h2>
        <p className="text-[#6B6B6B]">Please don't close or refresh this page.</p>
      </div>);
    }
    if (payFailed) {
        return (<div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="text-5xl">✗</div>
        <h2 className="font-display text-3xl font-bold text-[#111]">Payment unsuccessful</h2>
        <p className="text-[#6B6B6B]">We couldn't process your payment. Please check your details and try again.</p>
        <div className="flex gap-3 mt-4">
          <button onClick={() => setPayFailed(false)} className="bg-[#111] text-white px-8 py-3 text-sm font-bold tracking-widest">TRY AGAIN</button>
          <button onClick={() => { setPayFailed(false); setStep(3); }} className="border border-[#111] px-8 py-3 text-sm font-bold tracking-widest">CHANGE PAYMENT METHOD</button>
        </div>
      </div>);
    }
    return (<div className="max-w-[1440px] mx-auto px-6 py-10">
      {/* Progress */}
      <div className="flex items-center justify-center gap-0 mb-12 max-w-xl mx-auto">
        {steps.map((s, i) => (<div key={s} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className={`w-7 h-7 flex items-center justify-center text-xs font-bold border-2 transition-all ${step > i + 1 ? 'bg-[#111] border-[#111] text-white' : step === i + 1 ? 'border-[#111] text-[#111]' : 'border-[#E5E5E5] text-[#C5C5C5]'}`}>{step > i + 1 ? '✓' : i + 1}</div>
              <p className={`text-[10px] mt-1 font-medium ${step === i + 1 ? 'text-[#111]' : 'text-[#C5C5C5]'}`}>{s}</p>
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 mb-4 transition-all ${step > i + 1 ? 'bg-[#111]' : 'bg-[#E5E5E5]'}`}/>}
          </div>))}
      </div>

      <div className="grid lg:grid-cols-3 gap-10 max-w-4xl mx-auto">
        <div className="lg:col-span-2">
          {step === 1 && (<div className="flex flex-col gap-4">
              <h2 className="font-display text-xl font-bold text-[#111] mb-2">Contact Information</h2>
              {fld('Email', 'email', 'you@example.com')}
              <div className="grid grid-cols-2 gap-4">
                {fld('First Name', 'first')}
                {fld('Last Name', 'last')}
              </div>
              {fld('Phone Number', 'phone', '0812345678')}
              <h2 className="font-display text-xl font-bold text-[#111] mt-4 mb-2">Shipping Address</h2>
              {fld('Address', 'address', '123 Sukhumvit Road')}
              {fld('Apartment / Unit (Optional)', 'apt', 'Floor 5, Suite 502')}
              <div className="grid grid-cols-2 gap-4">
                {fld('District', 'district')}
                {fld('Province', 'province')}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {fld('Postal Code', 'postal', '10110')}
                {fld('Country', 'country')}
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-[#111]"/> Save this address for next time
              </label>
              <button onClick={() => { if (validateInfo())
            setStep(2); }} className="bg-[#111] text-white py-4 text-sm font-bold tracking-widest hover:bg-[#333] transition-colors mt-2">CONTINUE TO DELIVERY</button>
            </div>)}

          {step === 2 && (<div>
              <h2 className="font-display text-xl font-bold text-[#111] mb-6">Delivery Method</h2>
              {[
                { id: 'standard', label: 'Standard Delivery', sub: '2–4 business days', price: 'FREE' },
                { id: 'express', label: 'Express Delivery', sub: '1–2 business days', price: '฿150' },
            ].map(opt => (<label key={opt.id} className={`flex items-center gap-4 border-2 p-5 mb-3 cursor-pointer transition-colors ${delivery === opt.id ? 'border-[#111]' : 'border-[#E5E5E5] hover:border-[#C5C5C5]'}`}>
                  <input type="radio" name="delivery" value={opt.id} checked={delivery === opt.id} onChange={() => setDelivery(opt.id)} className="accent-[#111]"/>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-[#111]">{opt.label}</p>
                    <p className="text-xs text-[#6B6B6B]">{opt.sub}</p>
                  </div>
                  <p className="font-bold text-sm text-[#111]">{opt.price}</p>
                </label>))}
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="border border-[#E5E5E5] px-6 py-4 text-sm font-medium hover:border-[#111] transition-colors">← Back</button>
                <button onClick={() => setStep(3)} className="flex-1 bg-[#111] text-white py-4 text-sm font-bold tracking-widest hover:bg-[#333] transition-colors">CONTINUE TO PAYMENT</button>
              </div>
            </div>)}

          {step === 3 && (<div>
              <h2 className="font-display text-xl font-bold text-[#111] mb-6">Payment Method</h2>
              {[
                { id: 'card', label: 'Credit / Debit Card' },
                { id: 'promptpay', label: 'PromptPay' },
                { id: 'cod', label: 'Cash on Delivery' },
            ].map(m => (<label key={m.id} className={`flex items-center gap-4 border-2 p-4 mb-3 cursor-pointer transition-colors ${payment === m.id ? 'border-[#111]' : 'border-[#E5E5E5] hover:border-[#C5C5C5]'}`}>
                  <input type="radio" name="payment" value={m.id} checked={payment === m.id} onChange={() => setPayment(m.id)} className="accent-[#111]"/>
                  <span className="font-medium text-sm text-[#111]">{m.label}</span>
                </label>))}

              {payment === 'card' && (<div className="border border-[#E5E5E5] p-5 mt-2 flex flex-col gap-3">
                  {[
                    { label: 'Card Number', key: 'number', placeholder: '1234 5678 9012 3456' },
                    { label: 'Name on Card', key: 'name', placeholder: 'Alex Smith' },
                ].map(({ label, key, placeholder }) => (<div key={key}>
                      <label className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] block mb-1">{label}</label>
                      <input value={card[key]} onChange={e => setCard(c => ({ ...c, [key]: e.target.value }))} placeholder={placeholder} className={`w-full border px-4 py-3 text-sm focus:border-[#111] transition-colors ${cardErrors[key] ? 'border-red-500 bg-red-50' : 'border-[#E5E5E5]'}`}/>
                      {cardErrors[key] && <p className="text-red-600 text-xs mt-1">{cardErrors[key]}</p>}
                    </div>))}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] block mb-1">Expiry Date</label>
                      <input value={card.expiry} onChange={e => setCard(c => ({ ...c, expiry: e.target.value }))} placeholder="MM/YY" className={`w-full border px-4 py-3 text-sm focus:border-[#111] transition-colors ${cardErrors.expiry ? 'border-red-500 bg-red-50' : 'border-[#E5E5E5]'}`}/>
                      {cardErrors.expiry && <p className="text-red-600 text-xs mt-1">{cardErrors.expiry}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] block mb-1">CVV</label>
                      <input value={card.cvv} onChange={e => setCard(c => ({ ...c, cvv: e.target.value }))} placeholder="123" maxLength={3} className={`w-full border px-4 py-3 text-sm focus:border-[#111] transition-colors ${cardErrors.cvv ? 'border-red-500 bg-red-50' : 'border-[#E5E5E5]'}`}/>
                      {cardErrors.cvv && <p className="text-red-600 text-xs mt-1">{cardErrors.cvv}</p>}
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-[#111]"/> Billing address is the same as shipping address
                  </label>
                </div>)}

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(2)} className="border border-[#E5E5E5] px-6 py-4 text-sm font-medium hover:border-[#111] transition-colors">← Back</button>
                <button onClick={() => { if (payment !== 'card' || validateCard())
            setStep(4); }} className="flex-1 bg-[#111] text-white py-4 text-sm font-bold tracking-widest hover:bg-[#333] transition-colors">CONTINUE TO REVIEW</button>
              </div>
            </div>)}

          {step === 4 && (<div>
              <h2 className="font-display text-xl font-bold text-[#111] mb-6">Review Your Order</h2>
              <div className="flex flex-col gap-4">
                {[
                { label: 'Shipping Address', value: `${form.first} ${form.last}\n${form.address}${form.apt ? ', ' + form.apt : ''}\n${form.district}, ${form.province} ${form.postal}\n${form.country}` },
                { label: 'Delivery', value: delivery === 'express' ? 'Express Delivery (1–2 business days) — ฿150' : 'Standard Delivery (2–4 business days) — FREE' },
                { label: 'Payment', value: payment === 'card' ? `Visa ending ····${card.number.slice(-4)}` : payment === 'promptpay' ? 'PromptPay' : 'Cash on Delivery' },
            ].map(row => (<div key={row.label} className="bg-white border border-[#E5E5E5] p-4 flex justify-between gap-4">
                    <p className="text-xs font-bold tracking-widest uppercase text-[#6B6B6B] flex-shrink-0 w-28">{row.label}</p>
                    <p className="text-sm text-[#111] whitespace-pre-line text-right">{row.value}</p>
                  </div>))}
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer mt-5">
                <input type="checkbox" required className="accent-[#111]"/> I agree to the Terms of Sale.
              </label>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(3)} className="border border-[#E5E5E5] px-6 py-4 text-sm font-medium hover:border-[#111] transition-colors">← Back</button>
                <button onClick={handlePlaceOrder} className="flex-1 bg-[#111] text-white py-4 text-sm font-bold tracking-widest hover:bg-[#333] transition-colors">PLACE ORDER</button>
              </div>
            </div>)}
        </div>

        {/* Summary sidebar */}
        <div className="bg-white p-5 h-fit">
          <p className="font-bold text-xs tracking-widest uppercase mb-4">Order Summary</p>
          <div className="flex flex-col gap-2 text-sm border-b border-[#E5E5E5] pb-4 mb-4">
            <div className="flex justify-between"><span className="text-[#6B6B6B]">Subtotal</span><span>฿{cartTotal.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-[#6B6B6B]">Shipping</span><span>{shipping === 0 ? 'FREE' : `฿${shipping}`}</span></div>
          </div>
          <div className="flex justify-between font-display font-extrabold text-[#111]"><span>Total</span><span>฿{total.toLocaleString()}</span></div>
        </div>
      </div>
    </div>);
}
function OrderConfirmationPage({ setPage }) {
    return (<div className="max-w-3xl mx-auto px-6 py-20 text-center">
      <div className="w-16 h-16 bg-green-700 flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
      </div>
      <p className="font-display text-xs font-bold tracking-[0.3em] uppercase text-[#6B6B6B] mb-3">Thank you for shopping with SOLEVA</p>
      <h1 className="font-display text-4xl font-extrabold text-[#111] mb-4">ORDER CONFIRMED</h1>
      <p className="text-[#6B6B6B] mb-2">Order <strong className="text-[#111]">SLV-20260822-1045</strong></p>
      <p className="text-[#6B6B6B] mb-10">Estimated delivery: <strong className="text-[#111]">25–27 August 2026</strong></p>

      <div className="bg-white border border-[#E5E5E5] p-6 text-left mb-8">
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { label: 'Delivery Address', value: 'Alex Smith\n123 Sukhumvit Rd, Apt 502\nWatthana, Bangkok 10110' },
            { label: 'Payment Method', value: 'Visa ending ····4242' },
            { label: 'Delivery Method', value: 'Standard Delivery\n2–4 business days\nFREE' },
        ].map(row => (<div key={row.label}>
              <p className="text-xs font-bold tracking-widest uppercase text-[#6B6B6B] mb-2">{row.label}</p>
              <p className="text-sm text-[#111] whitespace-pre-line">{row.value}</p>
            </div>))}
        </div>
        <div className="border-t border-[#E5E5E5] mt-6 pt-6 flex gap-4">
          <img src={imgUrl('photo-1637437757614-6491c8e915b5', 80, 80)} alt="Velocity Run Pro" className="w-16 h-16 object-cover bg-[#F7F7F7]"/>
          <div className="flex-1">
            <p className="font-bold text-sm text-[#111]">Velocity Run Pro</p>
            <p className="text-xs text-[#6B6B6B]">Black/White · Size 9 · Qty 1</p>
          </div>
          <p className="font-bold text-sm text-[#111]">฿4,590</p>
        </div>
        <div className="border-t border-[#E5E5E5] mt-4 pt-4 flex flex-col gap-2 text-sm">
          <div className="flex justify-between"><span className="text-[#6B6B6B]">Subtotal</span><span>฿4,590</span></div>
          <div className="flex justify-between text-green-700"><span>Discount (WELCOME10)</span><span>−฿459</span></div>
          <div className="flex justify-between"><span className="text-[#6B6B6B]">Shipping</span><span>FREE</span></div>
          <div className="flex justify-between font-display font-extrabold text-[#111] text-base pt-2 border-t border-[#E5E5E5]"><span>Total</span><span>฿4,131</span></div>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button onClick={() => setPage('account')} className="border border-[#111] text-[#111] px-8 py-4 text-sm font-bold tracking-widest hover:bg-[#111] hover:text-white transition-colors">VIEW ORDER</button>
        <button onClick={() => setPage('home')} className="bg-[#111] text-white px-8 py-4 text-sm font-bold tracking-widest hover:bg-[#333] transition-colors">CONTINUE SHOPPING</button>
      </div>
    </div>);
}
function LoginPage({ setPage }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = {};
        if (!email.match(/^[^@]+@[^@]+\.[^@]+$/))
            errs.email = 'Please enter a valid email address.';
        if (!password)
            errs.password = 'Password is required.';
        if (Object.keys(errs).length) {
            setErrors(errs);
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setErrors({ credentials: 'The email or password you entered is incorrect.' });
            setLoading(false);
        }, 1000);
    };
    return (<div className="min-h-[80vh] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-extrabold text-[#111] mb-2">Welcome Back</h1>
          <p className="text-[#6B6B6B] text-sm">Sign in to your SOLEVA account</p>
        </div>

        {errors.credentials && (<div className="bg-red-50 border border-red-200 p-4 text-red-700 text-sm mb-6">{errors.credentials}</div>)}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] block mb-1">Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={`w-full border px-4 py-3 text-sm focus:border-[#111] transition-colors ${errors.email ? 'border-red-500 bg-red-50' : 'border-[#E5E5E5]'}`}/>
            {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B]">Password</label>
              <button type="button" className="text-xs text-[#6B6B6B] hover:text-[#111] underline">Forgot Password?</button>
            </div>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={`w-full border px-4 py-3 text-sm focus:border-[#111] transition-colors ${errors.password ? 'border-red-500 bg-red-50' : 'border-[#E5E5E5]'}`}/>
            {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="accent-[#111]"/> Remember Me</label>
          <button type="submit" disabled={loading} className="bg-[#111] text-white py-4 text-sm font-bold tracking-widest hover:bg-[#333] transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-70">
            {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> SIGNING IN...</> : 'SIGN IN'}
          </button>
        </form>

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-[#E5E5E5]"/><span className="text-xs text-[#6B6B6B]">OR</span><div className="flex-1 h-px bg-[#E5E5E5]"/>
        </div>

        {[{ label: 'Continue with Google', icon: '🔍' }, { label: 'Continue with Apple', icon: '🍎' }].map(b => (<button key={b.label} className="w-full border border-[#E5E5E5] py-3 text-sm font-medium mb-3 flex items-center justify-center gap-2 hover:border-[#111] transition-colors">
            <span>{b.icon}</span> {b.label}
          </button>))}

        <p className="text-center text-sm text-[#6B6B6B] mt-6">
          Don't have an account? <button onClick={() => setPage('register')} className="text-[#111] font-bold hover:underline">CREATE ACCOUNT</button>
        </p>
      </div>
    </div>);
}
function RegisterPage({ setPage }) {
    const [form, setForm] = useState({ first: '', last: '', email: '', phone: '', pass: '', confirm: '' });
    const [errors, setErrors] = useState({});
    const [agreed, setAgreed] = useState(false);
    const pwChecks = [
        { label: 'At least 8 characters', ok: form.pass.length >= 8 },
        { label: 'One uppercase letter', ok: /[A-Z]/.test(form.pass) },
        { label: 'One lowercase letter', ok: /[a-z]/.test(form.pass) },
        { label: 'One number', ok: /[0-9]/.test(form.pass) },
    ];
    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = {};
        if (!form.email.match(/^[^@]+@[^@]+\.[^@]+$/))
            errs.email = 'Please enter a valid email address.';
        if (form.pass !== form.confirm)
            errs.confirm = 'Passwords do not match.';
        if (form.email === 'existing@example.com')
            errs.email = 'An account with this email already exists.';
        if (!agreed)
            errs.agreed = 'You must agree to the Terms & Conditions.';
        setErrors(errs);
        if (!Object.keys(errs).length)
            setPage('login');
    };
    return (<div className="min-h-[80vh] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-extrabold text-[#111] mb-2">Create Your SOLEVA Account</h1>
          <p className="text-[#6B6B6B] text-sm">Join the SOLEVA community</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            {[{ label: 'First Name', key: 'first' }, { label: 'Last Name', key: 'last' }].map(({ label, key }) => (<div key={key}>
                <label className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] block mb-1">{label}</label>
                <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className={`w-full border px-4 py-3 text-sm focus:border-[#111] transition-colors ${errors[key] ? 'border-red-500 bg-red-50' : 'border-[#E5E5E5]'}`}/>
              </div>))}
          </div>
          {[{ label: 'Email Address', key: 'email', type: 'email' }, { label: 'Phone Number', key: 'phone', type: 'tel' }].map(({ label, key, type }) => (<div key={key}>
              <label className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] block mb-1">{label}</label>
              <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className={`w-full border px-4 py-3 text-sm focus:border-[#111] transition-colors ${errors[key] ? 'border-red-500 bg-red-50' : 'border-[#E5E5E5]'}`}/>
              {errors[key] && <p className="text-red-600 text-xs mt-1">{errors[key]}</p>}
            </div>))}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] block mb-1">Password</label>
            <input type="password" value={form.pass} onChange={e => setForm(f => ({ ...f, pass: e.target.value }))} className="w-full border border-[#E5E5E5] px-4 py-3 text-sm focus:border-[#111] transition-colors"/>
            {form.pass && <div className="mt-2 flex flex-col gap-1">{pwChecks.map(c => <span key={c.label} className={`text-xs flex items-center gap-1 ${c.ok ? 'text-green-700' : 'text-[#6B6B6B]'}`}>{c.ok ? '✓' : '○'} {c.label}</span>)}</div>}
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] block mb-1">Confirm Password</label>
            <input type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} className={`w-full border px-4 py-3 text-sm focus:border-[#111] transition-colors ${errors.confirm ? 'border-red-500 bg-red-50' : 'border-[#E5E5E5]'}`}/>
            {errors.confirm && <p className="text-red-600 text-xs mt-1">{errors.confirm}</p>}
          </div>
          <label className="flex items-start gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="accent-[#111] mt-0.5"/>
            <span>I agree to the <button type="button" className="underline">Terms & Conditions</button> and <button type="button" className="underline">Privacy Policy</button>.</span>
          </label>
          {errors.agreed && <p className="text-red-600 text-xs">{errors.agreed}</p>}
          <button type="submit" className="bg-[#111] text-white py-4 text-sm font-bold tracking-widest hover:bg-[#333] transition-colors mt-2">CREATE ACCOUNT</button>
        </form>
        <p className="text-center text-sm text-[#6B6B6B] mt-6">Already have an account? <button onClick={() => setPage('login')} className="text-[#111] font-bold hover:underline">SIGN IN</button></p>
      </div>
    </div>);
}
function AccountPage({ setPage }) {
    const [tab, setTab] = useState('Overview');
    const tabs = ['Overview', 'My Orders', 'Wishlist', 'Addresses', 'Personal Info', 'Change Password'];
    const orders = [
        { id: 'SLV-20260822-1045', date: '22 Aug 2026', total: '฿4,131', status: 'Processing', item: PRODUCTS[0] },
        { id: 'SLV-20260801-0832', date: '1 Aug 2026', total: '฿5,290', status: 'Delivered', item: PRODUCTS[1] },
        { id: 'SLV-20260715-0561', date: '15 Jul 2026', total: '฿3,990', status: 'Delivered', item: PRODUCTS[3] },
    ];
    const statusColors = {
        Processing: 'bg-amber-50 text-amber-700 border-amber-200',
        Delivered: 'bg-green-50 text-green-700 border-green-200',
        Shipped: 'bg-blue-50 text-blue-700 border-blue-200',
        Cancelled: 'bg-red-50 text-red-700 border-red-200',
    };
    const orderTracking = ['Order Placed', 'Payment Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
    const currentStep = 2;
    return (<div className="max-w-[1440px] mx-auto px-6 py-10">
      <div className="grid lg:grid-cols-4 gap-10">
        {/* Sidebar */}
        <aside>
          <div className="bg-white p-6 mb-4">
            <div className="w-12 h-12 bg-[#111] flex items-center justify-center text-white font-bold text-lg mb-3">A</div>
            <p className="font-display font-bold text-[#111]">Hello, Alex</p>
            <p className="text-sm text-[#6B6B6B]">alex@example.com</p>
          </div>
          <nav className="flex flex-col">
            {tabs.map(t => (<button key={t} onClick={() => setTab(t)} className={`text-left px-4 py-3 text-sm font-medium border-b border-[#E5E5E5] transition-colors ${tab === t ? 'bg-[#111] text-white' : 'bg-white text-[#111] hover:bg-[#F7F7F7]'}`}>{t}</button>))}
            <button onClick={() => setPage('login')} className="text-left px-4 py-3 text-sm font-medium text-red-600 bg-white hover:bg-red-50 transition-colors">Logout</button>
          </nav>
        </aside>

        {/* Content */}
        <div className="lg:col-span-3">
          {tab === 'Overview' && (<div>
              <h2 className="font-display text-2xl font-extrabold text-[#111] mb-6">Account Overview</h2>
              <div className="grid sm:grid-cols-3 gap-4 mb-8">
                {[{ label: 'Orders', value: '3', icon: '📦' }, { label: 'Wishlist Items', value: '5', icon: '♡' }, { label: 'Saved Addresses', value: '1', icon: '📍' }].map(s => (<div key={s.label} className="bg-white p-6 border border-[#E5E5E5]">
                    <div className="text-2xl mb-2">{s.icon}</div>
                    <p className="font-display text-3xl font-extrabold text-[#111]">{s.value}</p>
                    <p className="text-sm text-[#6B6B6B]">{s.label}</p>
                  </div>))}
              </div>
              <h3 className="font-bold text-[#111] mb-4">Recent Order</h3>
              <div className="bg-white border border-[#E5E5E5] p-5 flex gap-4">
                <img src={imgUrl(orders[0].item.image, 80, 80)} alt="" className="w-16 h-16 object-cover bg-[#F7F7F7]"/>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-sm text-[#111]">{orders[0].id}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 border ${statusColors[orders[0].status]}`}>{orders[0].status}</span>
                  </div>
                  <p className="text-xs text-[#6B6B6B]">{orders[0].date}</p>
                  <p className="font-bold text-sm text-[#111] mt-2">{orders[0].total}</p>
                </div>
              </div>
            </div>)}

          {tab === 'My Orders' && (<div>
              <h2 className="font-display text-2xl font-extrabold text-[#111] mb-6">My Orders</h2>
              <div className="flex flex-col gap-4">
                {orders.map(o => (<div key={o.id} className="bg-white border border-[#E5E5E5] p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-bold text-[#111] text-sm">{o.id}</p>
                        <p className="text-xs text-[#6B6B6B]">{o.date}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 border ${statusColors[o.status]}`}>{o.status}</span>
                    </div>
                    <div className="flex gap-4 items-center">
                      <img src={imgUrl(o.item.image, 80, 80)} alt="" className="w-14 h-14 object-cover bg-[#F7F7F7]"/>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-[#111]">{o.item.name}</p>
                        <p className="text-xs text-[#6B6B6B]">{o.item.gender} {o.item.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#111]">{o.total}</p>
                        <button className="text-xs text-[#6B6B6B] hover:text-[#111] underline mt-1">VIEW ORDER</button>
                      </div>
                    </div>
                    {o.status === 'Processing' && (<div className="mt-5 pt-4 border-t border-[#E5E5E5]">
                        <p className="text-xs font-bold tracking-widest uppercase text-[#6B6B6B] mb-3">Order Tracking</p>
                        <div className="flex items-center gap-0">
                          {orderTracking.map((step, i) => (<div key={step} className="flex items-center flex-1">
                              <div className="flex flex-col items-center flex-shrink-0">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i <= currentStep ? 'bg-[#111] text-white' : i === currentStep + 1 ? 'border-2 border-[#111]' : 'border-2 border-[#E5E5E5]'}`}>
                                  {i <= currentStep ? '✓' : ''}
                                </div>
                                <p className="text-[8px] text-[#6B6B6B] mt-1 text-center w-12">{step}</p>
                              </div>
                              {i < orderTracking.length - 1 && <div className={`flex-1 h-0.5 mb-4 ${i < currentStep ? 'bg-[#111]' : 'bg-[#E5E5E5]'}`}/>}
                            </div>))}
                        </div>
                      </div>)}
                  </div>))}
              </div>
            </div>)}

          {tab === 'Wishlist' && (<div>
              <h2 className="font-display text-2xl font-extrabold text-[#111] mb-6">My Wishlist</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {PRODUCTS.slice(0, 5).map(p => (<div key={p.id} className="bg-white border border-[#E5E5E5]">
                    <img src={imgUrl(p.image, 400, 300)} alt={p.name} className="w-full aspect-square object-cover bg-[#F7F7F7]"/>
                    <div className="p-4">
                      <p className="font-bold text-sm text-[#111] mb-1">{p.name}</p>
                      <p className="text-sm text-[#6B6B6B] mb-3">฿{(p.salePrice ?? p.price).toLocaleString()}</p>
                      <button className="w-full bg-[#111] text-white py-2.5 text-xs font-bold tracking-widest hover:bg-[#333] transition-colors mb-2">SELECT SIZE & ADD TO BAG</button>
                      <button className="w-full border border-[#E5E5E5] py-2 text-xs font-medium hover:border-[#111] transition-colors">REMOVE</button>
                    </div>
                  </div>))}
              </div>
            </div>)}

          {tab === 'Personal Info' && (<div>
              <h2 className="font-display text-2xl font-extrabold text-[#111] mb-6">Personal Information</h2>
              <div className="bg-white border border-[#E5E5E5] p-6 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  {[{ label: 'First Name', value: 'Alex' }, { label: 'Last Name', value: 'Smith' }].map(f => (<div key={f.label}>
                      <label className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] block mb-1">{f.label}</label>
                      <input defaultValue={f.value} className="w-full border border-[#E5E5E5] px-4 py-3 text-sm focus:border-[#111] transition-colors"/>
                    </div>))}
                </div>
                {[{ label: 'Email Address', value: 'alex@example.com', type: 'email' }, { label: 'Phone Number', value: '+66 81 234 5678', type: 'tel' }].map(f => (<div key={f.label}>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] block mb-1">{f.label}</label>
                    <input type={f.type} defaultValue={f.value} className="w-full border border-[#E5E5E5] px-4 py-3 text-sm focus:border-[#111] transition-colors"/>
                  </div>))}
                <button className="bg-[#111] text-white py-3 text-sm font-bold tracking-widest hover:bg-[#333] transition-colors mt-2 self-start px-8">SAVE CHANGES</button>
              </div>
            </div>)}

          {(tab === 'Addresses' || tab === 'Change Password') && (<div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-5xl mb-4">{tab === 'Addresses' ? '📍' : '🔑'}</div>
              <h3 className="font-display text-xl font-bold text-[#111] mb-2">{tab}</h3>
              <p className="text-[#6B6B6B] text-sm">Manage your {tab.toLowerCase()} here.</p>
            </div>)}
        </div>
      </div>
    </div>);
}
function SalePage({ setPage, addToCart, setSelectedProduct, addToWishlist }) {
    const saleProducts = PRODUCTS.filter(p => p.isSale);
    return (<div>
      <div className="bg-[#111] py-20 text-center">
        <p className="text-white/50 text-xs font-bold tracking-[0.3em] uppercase mb-3">Limited Time</p>
        <h1 className="font-display text-6xl sm:text-8xl font-extrabold text-white mb-3">END OF SEASON SALE</h1>
        <p className="text-red-400 font-display text-3xl font-extrabold">UP TO 40% OFF</p>
      </div>
      <div className="max-w-[1440px] mx-auto px-6 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {saleProducts.map(p => <ProductCard key={p.id} product={p} setPage={setPage} setSelectedProduct={setSelectedProduct} addToWishlist={addToWishlist}/>)}
        </div>
      </div>
    </div>);
}
function AdminPage({ setPage }) {
    const [adminTab, setAdminTab] = useState('Dashboard');
    const [addProductOpen, setAddProductOpen] = useState(false);
    const sidebarItems = ['Dashboard', 'Products', 'Orders', 'Customers', 'Inventory', 'Promotions', 'Reviews', 'Reports', 'Settings'];
    const stats = [
        { label: 'Total Revenue', value: '฿248,600', change: '+12.5%', up: true },
        { label: 'Orders', value: '182', change: '+8.2%', up: true },
        { label: 'Customers', value: '1,284', change: '+6.4%', up: true },
        { label: 'Products', value: '86', change: '', up: true },
    ];
    const recentOrders = [
        { id: 'SLV-20260822-1045', customer: 'Alex Smith', date: '22 Aug 2026', total: '฿4,590', payment: 'Paid', status: 'Processing' },
        { id: 'SLV-20260821-0931', customer: 'Sunisa K.', date: '21 Aug 2026', total: '฿8,290', payment: 'Paid', status: 'Shipped' },
        { id: 'SLV-20260820-0814', customer: 'Marco L.', date: '20 Aug 2026', total: '฿3,290', payment: 'Paid', status: 'Delivered' },
        { id: 'SLV-20260819-0702', customer: 'Priya N.', date: '19 Aug 2026', total: '฿6,490', payment: 'Paid', status: 'Processing' },
    ];
    const adminProducts = PRODUCTS.slice(0, 8).map((p, i) => ({
        ...p,
        sku: `SLV-${p.category.toUpperCase().slice(0, 3)}-00${i + 1}`,
        stock: [24, 8, 3, 41, 15, 52, 2, 18][i],
        status: i === 6 ? 'Low Stock' : 'Active'
    }));
    const customers = [
        { name: 'Alex Smith', email: 'alex@example.com', orders: 8, spent: '฿32,450', joined: '3 Jan 2026', status: 'Active' },
        { name: 'Sunisa Kongsuk', email: 'sunisa@example.com', orders: 5, spent: '฿19,280', joined: '14 Mar 2026', status: 'Active' },
        { name: 'Marco Luca', email: 'marco@example.com', orders: 12, spent: '฿55,120', joined: '22 Nov 2025', status: 'Active' },
        { name: 'Priya Nair', email: 'priya@example.com', orders: 3, spent: '฿12,090', joined: '8 Jun 2026', status: 'Active' },
    ];

    const statusColors = {
        Processing: 'bg-amber-50 text-amber-700',
        Shipped: 'bg-blue-50 text-blue-700',
        Delivered: 'bg-green-50 text-green-700',
        Cancelled: 'bg-red-50 text-red-700',
        Active: 'bg-green-50 text-green-700',
        'Low Stock': 'bg-amber-50 text-amber-700',
        'Out of Stock': 'bg-red-50 text-red-700',
    };
    return (<div className="min-h-screen bg-[#F7F7F7] flex">
      {/* Sidebar */}
      <aside className="w-56 bg-[#111] text-white flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-white/10">
          <p className="font-display font-extrabold text-sm tracking-widest">SOLEVA ADMIN</p>
        </div>
        <nav className="flex-1 py-4">
          {sidebarItems.map(item => (<button key={item} onClick={() => setAdminTab(item)} className={`w-full text-left px-5 py-3 text-sm font-medium transition-colors ${adminTab === item ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>{item}</button>))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <button onClick={() => setPage('home')} className="w-full text-left px-1 py-2 text-sm text-white/50 hover:text-white transition-colors">← Back to Store</button>
          <button onClick={() => setPage('login')} className="w-full text-left px-1 py-2 text-sm text-red-400 hover:text-red-300 transition-colors">Logout</button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 overflow-auto">
        {/* Top bar */}
        <header className="bg-white border-b border-[#E5E5E5] px-8 h-14 flex items-center justify-between sticky top-0 z-10">
          <h1 className="font-display font-bold text-[#111]">{adminTab}</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input placeholder="Search..." className="border border-[#E5E5E5] pl-8 pr-4 py-1.5 text-sm focus:border-[#111] transition-colors w-48"/>
              <svg className="w-4 h-4 absolute left-2.5 top-2 text-[#6B6B6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <div className="w-8 h-8 bg-[#111] text-white flex items-center justify-center text-xs font-bold">AD</div>
          </div>
        </header>

        <div className="p-8">
          {adminTab === 'Dashboard' && (<div>
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                {stats.map(s => (<div key={s.label} className="bg-white p-5 border border-[#E5E5E5]">
                    <p className="text-xs text-[#6B6B6B] uppercase tracking-wider mb-1">{s.label}</p>
                    <p className="font-display text-2xl font-extrabold text-[#111]">{s.value}</p>
                    {s.change && <p className={`text-sm font-medium mt-1 ${s.up ? 'text-green-700' : 'text-red-600'}`}>{s.change} vs last month</p>}
                  </div>))}
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white border border-[#E5E5E5] p-5">
                  <p className="font-bold text-sm text-[#111] mb-5">Recent Orders</p>
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-[#E5E5E5]">{['Order ID', 'Customer', 'Date', 'Total', 'Payment', 'Status', ''].map(h => <th key={h} className="text-left text-xs font-bold tracking-wider text-[#6B6B6B] pb-3 pr-4">{h}</th>)}</tr></thead>
                    <tbody>
                      {recentOrders.map(o => (<tr key={o.id} className="border-b border-[#E5E5E5] hover:bg-[#F7F7F7]">
                          <td className="py-3 pr-4 font-mono text-xs text-[#111]">{o.id}</td>
                          <td className="py-3 pr-4 text-[#111]">{o.customer}</td>
                          <td className="py-3 pr-4 text-[#6B6B6B]">{o.date}</td>
                          <td className="py-3 pr-4 font-medium text-[#111]">{o.total}</td>
                          <td className="py-3 pr-4"><span className="text-green-700 text-xs">{o.payment}</span></td>
                          <td className="py-3 pr-4"><span className={`text-xs px-2 py-0.5 font-medium ${statusColors[o.status]}`}>{o.status}</span></td>
                          <td className="py-3"><button className="text-xs underline text-[#6B6B6B] hover:text-[#111]">VIEW</button></td>
                        </tr>))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-white border border-[#E5E5E5] p-5">
                  <p className="font-bold text-sm text-[#111] mb-5">Low Stock Alert</p>
                  {adminProducts.filter(p => p.stock < 5).map(p => (<div key={p.id} className="flex items-center gap-3 mb-4 pb-4 border-b border-[#E5E5E5] last:border-0 last:mb-0 last:pb-0">
                      <img src={imgUrl(p.image, 48, 48)} alt="" className="w-10 h-10 object-cover bg-[#F7F7F7]"/>
                      <div className="flex-1">
                        <p className="font-medium text-xs text-[#111]">{p.name}</p>
                        <p className="text-[10px] text-amber-600 font-bold">{p.stock} remaining · LOW STOCK</p>
                      </div>
                      <button className="text-[10px] text-[#6B6B6B] underline hover:text-[#111]">UPDATE</button>
                    </div>))}
                </div>
              </div>
            </div>)}

          {adminTab === 'Products' && (<div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-3">
                  <input placeholder="Search products..." className="border border-[#E5E5E5] px-3 py-2 text-sm focus:border-[#111] transition-colors w-56"/>
                  {['Category', 'Status', 'Stock'].map(f => <select key={f} className="border border-[#E5E5E5] px-3 py-2 text-sm bg-white focus:border-[#111] transition-colors"><option>{f}</option></select>)}
                </div>
                <button onClick={() => setAddProductOpen(true)} className="bg-[#111] text-white px-5 py-2.5 text-sm font-bold tracking-widest hover:bg-[#333] transition-colors">+ ADD PRODUCT</button>
              </div>
              <div className="bg-white border border-[#E5E5E5] overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F7F7F7] border-b border-[#E5E5E5]">{['Product', 'SKU', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => <th key={h} className="text-left text-xs font-bold tracking-wider text-[#6B6B6B] p-4">{h}</th>)}</tr></thead>
                  <tbody>
                    {adminProducts.map(p => (<tr key={p.id} className="border-b border-[#E5E5E5] hover:bg-[#F7F7F7]">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={imgUrl(p.image, 48, 48)} alt="" className="w-10 h-10 object-cover bg-[#F7F7F7]"/>
                            <span className="font-medium text-[#111]">{p.name}</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-xs text-[#6B6B6B]">{p.sku}</td>
                        <td className="p-4 text-[#6B6B6B]">{p.category}</td>
                        <td className="p-4 font-medium text-[#111]">฿{p.price.toLocaleString()}</td>
                        <td className="p-4"><span className={p.stock < 5 ? 'text-amber-600 font-bold' : 'text-[#111]'}>{p.stock}</span></td>
                        <td className="p-4"><span className={`text-xs px-2 py-0.5 font-medium ${statusColors[p.status]}`}>{p.status}</span></td>
                        <td className="p-4">
                          <div className="flex gap-3">
                            <button className="text-xs underline text-[#6B6B6B] hover:text-[#111]">Edit</button>
                            <button className="text-xs underline text-red-600 hover:text-red-800">Delete</button>
                          </div>
                        </td>
                      </tr>))}
                  </tbody>
                </table>
              </div>

              {addProductOpen && (<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6" onClick={() => setAddProductOpen(false)}>
                  <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-auto p-8" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-display text-xl font-bold text-[#111]">Add Product</h2>
                      <button onClick={() => setAddProductOpen(false)} className="text-[#6B6B6B] hover:text-[#111] text-2xl">&times;</button>
                    </div>
                    <div className="flex flex-col gap-4">
                      {[['Product Name', ''], ['SKU', ''], ['Brand', ''], ['Description', '']].map(([label]) => (<div key={label}>
                          <label className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] block mb-1">{label}</label>
                          {label === 'Description' ? <textarea rows={3} className="w-full border border-[#E5E5E5] px-4 py-3 text-sm focus:border-[#111] transition-colors"/> : <input className="w-full border border-[#E5E5E5] px-4 py-3 text-sm focus:border-[#111] transition-colors"/>}
                        </div>))}
                      <div className="grid grid-cols-2 gap-4">
                        {[['Gender', ['Men', 'Women', 'Unisex', 'Kids']], ['Category', ['Running', 'Lifestyle', 'Basketball', 'Training']]].map(([label, opts]) => (<div key={label}>
                            <label className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] block mb-1">{label}</label>
                            <select className="w-full border border-[#E5E5E5] px-4 py-3 text-sm focus:border-[#111] transition-colors bg-white">
                              {opts.map(o => <option key={o}>{o}</option>)}
                            </select>
                          </div>))}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {['Original Price (฿)', 'Sale Price (฿)'].map(l => (<div key={l}>
                            <label className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] block mb-1">{l}</label>
                            <input type="number" className="w-full border border-[#E5E5E5] px-4 py-3 text-sm focus:border-[#111] transition-colors"/>
                          </div>))}
                      </div>
                      <div className="border-2 border-dashed border-[#E5E5E5] p-8 text-center hover:border-[#111] transition-colors cursor-pointer">
                        <p className="text-2xl mb-2">📷</p>
                        <p className="text-sm font-medium text-[#111]">Drop images here or click to upload</p>
                        <p className="text-xs text-[#6B6B6B] mt-1">PNG, JPG up to 10MB</p>
                      </div>
                      <div className="flex gap-2 items-center">
                        <span className="text-sm">Featured Product</span>
                        <div className="w-10 h-5 bg-[#E5E5E5] rounded-full cursor-pointer relative"><div className="w-4 h-4 bg-white rounded-full absolute top-0.5 left-0.5 shadow"/></div>
                        <span className="text-sm ml-4">New Arrival</span>
                        <div className="w-10 h-5 bg-[#111] rounded-full cursor-pointer relative"><div className="w-4 h-4 bg-white rounded-full absolute top-0.5 right-0.5 shadow"/></div>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button className="flex-1 bg-[#111] text-white py-3 text-sm font-bold tracking-widest hover:bg-[#333] transition-colors">SAVE PRODUCT</button>
                        <button className="flex-1 border border-[#E5E5E5] py-3 text-sm font-medium hover:border-[#111] transition-colors">SAVE AS DRAFT</button>
                        <button onClick={() => setAddProductOpen(false)} className="px-6 py-3 text-sm font-medium text-[#6B6B6B] hover:text-[#111]">Cancel</button>
                      </div>
                    </div>
                  </div>
                </div>)}
            </div>)}

          {adminTab === 'Orders' && (<div>
              <div className="flex gap-2 mb-6 flex-wrap">
                {['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'].map(f => (<button key={f} className="border border-[#E5E5E5] px-4 py-2 text-sm font-medium hover:border-[#111] hover:bg-[#111] hover:text-white transition-colors">{f}</button>))}
              </div>
              <div className="bg-white border border-[#E5E5E5]">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F7F7F7] border-b border-[#E5E5E5]">{['Order ID', 'Customer', 'Date', 'Total', 'Payment', 'Status', 'Actions'].map(h => <th key={h} className="text-left text-xs font-bold tracking-wider text-[#6B6B6B] p-4">{h}</th>)}</tr></thead>
                  <tbody>
                    {recentOrders.map(o => (<tr key={o.id} className="border-b border-[#E5E5E5] hover:bg-[#F7F7F7]">
                        <td className="p-4 font-mono text-xs text-[#111]">{o.id}</td>
                        <td className="p-4 font-medium text-[#111]">{o.customer}</td>
                        <td className="p-4 text-[#6B6B6B]">{o.date}</td>
                        <td className="p-4 font-medium text-[#111]">{o.total}</td>
                        <td className="p-4"><span className="text-green-700 text-xs font-medium">{o.payment}</span></td>
                        <td className="p-4"><span className={`text-xs px-2 py-0.5 font-medium ${statusColors[o.status]}`}>{o.status}</span></td>
                        <td className="p-4"><button className="text-xs underline text-[#6B6B6B] hover:text-[#111]">VIEW</button></td>
                      </tr>))}
                  </tbody>
                </table>
              </div>
            </div>)}

          {adminTab === 'Customers' && (<div className="bg-white border border-[#E5E5E5]">
              <table className="w-full text-sm">
                <thead><tr className="bg-[#F7F7F7] border-b border-[#E5E5E5]">{['Customer', 'Email', 'Phone', 'Orders', 'Total Spent', 'Joined', 'Status', ''].map(h => <th key={h} className="text-left text-xs font-bold tracking-wider text-[#6B6B6B] p-4">{h}</th>)}</tr></thead>
                <tbody>
                  {customers.map((c, i) => (<tr key={i} className="border-b border-[#E5E5E5] hover:bg-[#F7F7F7]">
                      <td className="p-4 font-medium text-[#111]">{c.name}</td>
                      <td className="p-4 text-[#6B6B6B]">{c.email}</td>
                      <td className="p-4 text-[#6B6B6B]">+66 8X XXX XXXX</td>
                      <td className="p-4 text-[#111]">{c.orders} Orders</td>
                      <td className="p-4 font-medium text-[#111]">{c.spent}</td>
                      <td className="p-4 text-[#6B6B6B]">{c.joined}</td>
                      <td className="p-4"><span className="text-xs px-2 py-0.5 font-medium bg-green-50 text-green-700">{c.status}</span></td>
                      <td className="p-4"><button className="text-xs underline text-[#6B6B6B] hover:text-[#111]">VIEW</button></td>
                    </tr>))}
                </tbody>
              </table>
            </div>)}

          {adminTab === 'Inventory' && (<div className="bg-white border border-[#E5E5E5]">
              <table className="w-full text-sm">
                <thead><tr className="bg-[#F7F7F7] border-b border-[#E5E5E5]">{['Product', 'SKU', 'Size', 'Stock', 'Status', 'Action'].map(h => <th key={h} className="text-left text-xs font-bold tracking-wider text-[#6B6B6B] p-4">{h}</th>)}</tr></thead>
                <tbody>
                  {adminProducts.flatMap(p => [9, 9.5, 10].map(size => ({
                name: p.name, sku: p.sku, size,
                stock: p.stock < 5 ? Math.max(1, p.stock - 1) : Math.floor(p.stock / 3),
            }))).slice(0, 10).map((row, i) => {
                const status = row.stock < 5 ? 'Low Stock' : row.stock === 0 ? 'Out of Stock' : 'In Stock';
                return (<tr key={i} className="border-b border-[#E5E5E5] hover:bg-[#F7F7F7]">
                        <td className="p-4 font-medium text-[#111]">{row.name}</td>
                        <td className="p-4 font-mono text-xs text-[#6B6B6B]">{row.sku}</td>
                        <td className="p-4 text-[#111]">US {row.size}</td>
                        <td className="p-4"><span className={row.stock < 5 ? 'text-amber-600 font-bold' : 'text-[#111]'}>{row.stock} remaining</span></td>
                        <td className="p-4"><span className={`text-xs px-2 py-0.5 font-medium ${statusColors[status] || 'bg-green-50 text-green-700'}`}>{status}</span></td>
                        <td className="p-4"><button className="text-xs bg-[#111] text-white px-3 py-1 hover:bg-[#333] transition-colors font-bold">UPDATE STOCK</button></td>
                      </tr>);
            })}
                </tbody>
              </table>
            </div>)}

          {adminTab === 'Promotions' && (<div>
              <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-[#6B6B6B]">{promotions.length} active promotions</p>
                <button className="bg-[#111] text-white px-5 py-2.5 text-sm font-bold tracking-widest hover:bg-[#333] transition-colors">CREATE PROMOTION</button>
              </div>
              <div className="bg-white border border-[#E5E5E5]">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F7F7F7] border-b border-[#E5E5E5]">{['Code', 'Discount', 'Min. Spend', 'Usage', 'Expiration', 'Status', ''].map(h => <th key={h} className="text-left text-xs font-bold tracking-wider text-[#6B6B6B] p-4">{h}</th>)}</tr></thead>
                  <tbody>
                    {promotions.map(p => (<tr key={p.code} className="border-b border-[#E5E5E5] hover:bg-[#F7F7F7]">
                        <td className="p-4 font-mono font-bold text-[#111]">{p.code}</td>
                        <td className="p-4 text-[#111]">{p.discount}</td>
                        <td className="p-4 text-[#6B6B6B]">฿{p.minSpend.toLocaleString('en-US')}</td>
                        <td className="p-4 text-[#6B6B6B]">{p.redemptionCount} / {p.redemptionLimit}</td>
                        <td className="p-4 text-[#6B6B6B]">{p.expires}</td>
                        <td className="p-4"><span className="text-xs px-2 py-0.5 bg-green-50 text-green-700 font-medium">{p.status}</span></td>
                        <td className="p-4">
                          <div className="flex gap-3">
                            <button className="text-xs underline text-[#6B6B6B] hover:text-[#111]">Edit</button>
                            <button className="text-xs underline text-red-600">Delete</button>
                          </div>
                        </td>
                      </tr>))}
                  </tbody>
                </table>
              </div>
            </div>)}

          {adminTab === 'Reviews' && (<div className="bg-white border border-[#E5E5E5]">
              <table className="w-full text-sm">
                <thead><tr className="bg-[#F7F7F7] border-b border-[#E5E5E5]">{['Customer', 'Product', 'Rating', 'Review', 'Date', 'Status', 'Actions'].map(h => <th key={h} className="text-left text-xs font-bold tracking-wider text-[#6B6B6B] p-4">{h}</th>)}</tr></thead>
                <tbody>
                  {[
                { customer: 'James T.', product: 'Velocity Run Pro', rating: 5, review: 'Excellent everyday running shoes. Very comfortable...', date: '12 Aug 2026', status: 'Approved' },
                { customer: 'Sunisa K.', product: 'AeroRun Elite', rating: 4, review: 'Great fit, runs slightly narrow...', date: '3 Aug 2026', status: 'Approved' },
                { customer: 'Marco L.', product: 'TrailForce GTX', rating: 5, review: 'Best running shoes I have owned...', date: '27 Jul 2026', status: 'Pending' },
            ].map((r, i) => (<tr key={i} className="border-b border-[#E5E5E5] hover:bg-[#F7F7F7]">
                      <td className="p-4 font-medium text-[#111]">{r.customer}</td>
                      <td className="p-4 text-[#6B6B6B]">{r.product}</td>
                      <td className="p-4"><span className="text-amber-400">{'★'.repeat(r.rating)}</span></td>
                      <td className="p-4 text-[#6B6B6B] max-w-xs truncate">{r.review}</td>
                      <td className="p-4 text-[#6B6B6B]">{r.date}</td>
                      <td className="p-4"><span className={`text-xs px-2 py-0.5 font-medium ${r.status === 'Approved' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{r.status}</span></td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button className="text-xs underline text-green-700">Approve</button>
                          <button className="text-xs underline text-[#6B6B6B]">Hide</button>
                          <button className="text-xs underline text-red-600">Delete</button>
                        </div>
                      </td>
                    </tr>))}
                </tbody>
              </table>
            </div>)}

          {adminTab === 'Reports' && (<div className="grid lg:grid-cols-2 gap-6">
              {[
                { title: 'Revenue (Aug 2026)', value: '฿248,600', change: '+12.5%' },
                { title: 'Total Orders', value: '182', change: '+8.2%' },
                { title: 'Average Order Value', value: '฿1,366', change: '+3.8%' },
                { title: 'New Customers', value: '94', change: '+6.4%' },
            ].map(s => (<div key={s.title} className="bg-white border border-[#E5E5E5] p-6">
                  <p className="text-xs text-[#6B6B6B] uppercase tracking-wider mb-2">{s.title}</p>
                  <p className="font-display text-3xl font-extrabold text-[#111] mb-1">{s.value}</p>
                  <p className="text-sm text-green-700 font-medium">{s.change} vs last month</p>
                  <div className="mt-4 flex gap-px h-16 items-end">
                    {[40, 55, 45, 70, 60, 80, 75, 90, 65, 85, 95, 100].map((h, i) => (<div key={i} className="flex-1 bg-[#111]" style={{ height: `${h}%`, opacity: 0.1 + (i / 15) }}/>))}
                  </div>
                </div>))}
              <div className="bg-white border border-[#E5E5E5] p-6 lg:col-span-2">
                <p className="font-bold text-sm text-[#111] mb-5">Best-Selling Products</p>
                <div className="flex flex-col gap-3">
                  {PRODUCTS.slice(0, 5).map((p, i) => (<div key={p.id} className="flex items-center gap-4">
                      <span className="font-display font-bold text-[#C5C5C5] w-5">{i + 1}</span>
                      <img src={imgUrl(p.image, 40, 40)} alt="" className="w-8 h-8 object-cover bg-[#F7F7F7]"/>
                      <span className="flex-1 text-sm font-medium text-[#111]">{p.name}</span>
                      <div className="flex-1 max-w-[200px] h-2 bg-[#F7F7F7] overflow-hidden">
                        <div className="h-full bg-[#111]" style={{ width: `${100 - i * 18}%` }}/>
                      </div>
                      <span className="text-sm font-bold text-[#111] w-16 text-right">{(40 - i * 7)} units</span>
                    </div>))}
                </div>
              </div>
            </div>)}

          {adminTab === 'Settings' && (<div className="bg-white border border-[#E5E5E5] p-8 max-w-xl">
              <h3 className="font-display font-bold text-[#111] mb-6">Store Settings</h3>
              {[{ label: 'Store Name', value: 'SOLEVA' }, { label: 'Store Email', value: 'hello@soleva.com' }, { label: 'Support Phone', value: '+66 2 XXX XXXX' }, { label: 'Currency', value: 'THB (฿)' }].map(f => (<div key={f.label} className="mb-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] block mb-1">{f.label}</label>
                  <input defaultValue={f.value} className="w-full border border-[#E5E5E5] px-4 py-3 text-sm focus:border-[#111] transition-colors"/>
                </div>))}
              <button className="bg-[#111] text-white py-3 px-8 text-sm font-bold tracking-widest hover:bg-[#333] transition-colors">SAVE SETTINGS</button>
            </div>)}
        </div>
      </div>
    </div>);
}
function NotFoundPage({ setPage }) {
    return (<div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-20">
      <p className="font-display text-[180px] font-extrabold text-[#E5E5E5] leading-none select-none">404</p>
      <h2 className="font-display text-3xl font-extrabold text-[#111] -mt-8 mb-4">Looks like you've taken a wrong step.</h2>
      <p className="text-[#6B6B6B] mb-10">The page you're looking for doesn't exist.</p>
      <div className="flex gap-4">
        <button onClick={() => setPage('home')} className="bg-[#111] text-white px-8 py-4 text-sm font-bold tracking-widest hover:bg-[#333] transition-colors">GO HOME</button>
        <button onClick={() => setPage('shop')} className="border border-[#111] text-[#111] px-8 py-4 text-sm font-bold tracking-widest hover:bg-[#111] hover:text-white transition-colors">SHOP SHOES</button>
      </div>
    </div>);
}
export default function App() {
    const redemptionSession = useRef({});
    const [page, setPage] = useState('home');
    const [cart, setCart] = useState([]);
    const [toasts, setToasts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0]);
    const toastId = useRef(0);
    const showToast = (message, type = 'success') => {
        const id = ++toastId.current;
        setToasts(t => [...t, { id, message, type }]);
        setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
    };
    const dismissToast = (id) => setToasts(t => t.filter(x => x.id !== id));
    const addToCart = (requestedProduct, size, color) => {
        const product = resolveCatalogProduct(requestedProduct, PRODUCTS);
        if (!product) {
            showToast('Invalid product. Please select a product from the catalog.', 'error');
            return;
        }
        if (!isValidProductColor(product, color, PRODUCTS)) {
            showToast('Please select a valid colour for this product.', 'error');
            return;
        }
        const stock = getStock(product, size, color);
        const currentQuantity = cart.find(i => i.product.id === product.id && i.size === size && i.color === color)?.quantity ?? 0;
        if (currentQuantity >= stock) {
            showToast(stock === 0 ? 'This size and colour combination is out of stock.' : `Maximum available quantity is ${stock}.`, 'error');
            return;
        }
        setCart(prev => {
            const existing = prev.findIndex(i => i.product.id === product.id && i.size === size && i.color === color);
            if (existing >= 0) {
                const updated = [...prev];
                updated[existing] = { ...updated[existing], quantity: updated[existing].quantity + 1 };
                return updated;
            }
            return [...prev, { product, size, color, quantity: 1 }];
        });
        showToast('Product added to your bag.', 'success');
    };
    const addToWishlist = (product) => {
        showToast('Wishlist updated.', 'success');
    };
    const updateQty = (idx, qty) => {
        const item = cart[idx];
        if (!item || !Number.isInteger(qty) || qty < 1) return;
        const stock = getStock(item.product, item.size, item.color);
        if (qty > stock) {
            showToast(`Maximum available quantity is ${stock}.`, 'error');
            return;
        }
        if (qty === item.quantity) return;
        showToast('Quantity updated', 'success');
        setCart(prev => { const u = [...prev]; u[idx] = { ...u[idx], quantity: qty }; return u; });
    };
    const removeFromCart = (idx) => {
        setCart(prev => prev.filter((_, i) => i !== idx));
        showToast('Item removed from your bag.', 'info');
    };
    const cartTotal = cart.reduce((s, i) => s + (i.product.salePrice ?? i.product.price) * i.quantity, 0);
    const isAdmin = page === 'admin';
    useEffect(() => { window.scrollTo(0, 0); }, [page]);
    return (<div className="min-h-screen flex flex-col">
      <ToastContainer toasts={toasts} dismiss={dismissToast}/>

      {!isAdmin && <AnnouncementBar />}
      {!isAdmin && <Header page={page} setPage={setPage} cartCount={cart.reduce((s, i) => s + i.quantity, 0)}/>}

      <main className="flex-1">
        {page === 'home' && <HomePage setPage={setPage} addToCart={addToCart} setSelectedProduct={setSelectedProduct} addToWishlist={addToWishlist}/>}
        {page === 'shop' && <ShopPage setPage={setPage} addToCart={addToCart} setSelectedProduct={setSelectedProduct} addToWishlist={addToWishlist}/>}
        {page === 'product' && <ProductDetailPage product={selectedProduct} setPage={setPage} addToCart={addToCart} addToWishlist={addToWishlist}/>}
        {page === 'cart' && <CartPage redemptionSession={redemptionSession.current} cart={cart} setPage={setPage} updateQty={updateQty} removeFromCart={removeFromCart} showToast={showToast}/>}
        {page === 'checkout' && <CheckoutPage setPage={setPage} cartTotal={cartTotal} showToast={showToast}/>}
        {page === 'confirmation' && <OrderConfirmationPage setPage={setPage}/>}
        {page === 'login' && <LoginPage setPage={setPage}/>}
        {page === 'register' && <RegisterPage setPage={setPage}/>}
        {page === 'account' && <AccountPage setPage={setPage}/>}
        {page === 'sale' && <SalePage setPage={setPage} addToCart={addToCart} setSelectedProduct={setSelectedProduct} addToWishlist={addToWishlist}/>}
        {page === 'admin' && <AdminPage setPage={setPage}/>}
        {page === '404' && <NotFoundPage setPage={setPage}/>}
      </main>

      {!isAdmin && <Footer setPage={setPage}/>}

      {/* Quick admin access */}
      {!isAdmin && (<button onClick={() => setPage('admin')} className="fixed bottom-6 right-6 bg-[#111] text-white text-xs font-bold px-3 py-2 shadow-lg hover:bg-[#333] transition-colors opacity-70 hover:opacity-100 z-40">
          ADMIN
        </button>)}
    </div>);
}
