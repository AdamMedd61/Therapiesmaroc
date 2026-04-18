import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X, MapPin, Monitor, Building2, Sparkles } from 'lucide-react';
import { therapists, specialtyList, cityList } from '../../data/therapists';
import TherapistCard from '../../components/TherapistCard';
import './DirectoryPage.css';

const MODE_OPTIONS = [
  { value: 'all', label: 'Tous les modes' },
  { value: 'online', label: 'En ligne' },
  { value: 'cabinet', label: 'En cabinet' },
];

const SORT_OPTIONS = [
  { value: 'rating', label: 'Mieux notés' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
  { value: 'avail', label: 'Disponibilité' },
];

const LANG_OPTIONS = ['Arabe', 'Français', 'Anglais', 'Darija', 'Tamazight'];

export default function DirectoryPage() {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('Toutes les villes');
  const [mode, setMode] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [selectedLangs, setSelectedLangs] = useState([]);
  const [maxPrice, setMaxPrice] = useState(800);
  const [showFilters, setShowFilters] = useState(true);

  const toggleSpecialty = (s) => {
    setSelectedSpecialties(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const toggleLang = (l) => {
    setSelectedLangs(prev =>
      prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]
    );
  };

  const resetFilters = () => {
    setQuery('');
    setCity('Toutes les villes');
    setMode('all');
    setSortBy('rating');
    setSelectedSpecialties([]);
    setSelectedLangs([]);
    setMaxPrice(800);
  };

  const filtered = useMemo(() => {
    let list = therapists.filter(t => {
      const q = query.toLowerCase();
      const matchQuery =
        !query ||
        t.name.toLowerCase().includes(q) ||
        t.specialties.some(s => s.toLowerCase().includes(q)) ||
        t.city.toLowerCase().includes(q);

      const matchCity = city === 'Toutes les villes' || t.city === city;
      const matchMode = mode === 'all' || t.modes.includes(mode);
      const matchPrice = t.price <= maxPrice;
      const matchSpec =
        selectedSpecialties.length === 0 ||
        selectedSpecialties.some(s => t.specialties.includes(s));
      const matchLang =
        selectedLangs.length === 0 ||
        selectedLangs.some(l => t.languages.includes(l));

      return matchQuery && matchCity && matchMode && matchPrice && matchSpec && matchLang;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      // availability: today first
      const order = { "Aujourd'hui": 0, 'Demain': 1, 'Cette semaine': 2, 'Semaine prochaine': 3 };
      return (order[a.availabilityNext] ?? 4) - (order[b.availabilityNext] ?? 4);
    });

    return list;
  }, [query, city, mode, sortBy, selectedSpecialties, selectedLangs, maxPrice]);

  const pricePercent = (maxPrice / 800 * 100).toFixed(0);

  const hasActiveFilters =
    selectedSpecialties.length > 0 ||
    selectedLangs.length > 0 ||
    city !== 'Toutes les villes' ||
    mode !== 'all' ||
    maxPrice < 800;

  return (
    <div className="dir-page">
      {/* ── HERO ── */}
      <div className="dir-hero">
        <div className="dir-hero-bg-glow" />
        <div className="container dir-hero-inner">
          <div className="dir-hero-content">
            <p className="section-eyebrow">Annuaire TherapiesMaroc</p>
            <h1 className="dir-hero-title">Trouvez votre thérapeute</h1>
            <p className="dir-hero-sub">
              {therapists.length} professionnels certifiés au Maroc, en ligne ou en cabinet
            </p>
          </div>

          {/* Simple search bar with glow */}
          <div className="dir-search-wrap">
            <div className="dir-search-box">
              <Search className="dir-search-icon" size={20} />
              <input
                type="search"
                className="input dir-search-input"
                placeholder="Nom, spécialité, approche..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                aria-label="Rechercher un thérapeute"
              />
              {query && (
                <button className="dir-search-clear" onClick={() => setQuery('')}>
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Quick suggestion tags */}
          <div className="dir-quick-tags">
            <span className="dir-quick-label"><Sparkles size={13} /> Suggestions :</span>
            {['Anxiété', 'Dépression', 'Couple', 'Burn-out', 'TCC', 'Enfants'].map(tag => (
              <button
                key={tag}
                className={`dir-quick-tag ${query === tag ? 'active' : ''}`}
                onClick={() => setQuery(query === tag ? '' : tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── SECTION ── */}
      <div className="container dir-layout">

        {/* Sidebar */}
        <aside className={`dir-sidebar ${showFilters ? 'open' : ''}`}>
          <div className="dir-sidebar-header">
            <h2 className="dir-sidebar-title">
              <SlidersHorizontal size={16} />
              Filtres
            </h2>
            {hasActiveFilters && (
              <button className="btn btn-ghost btn-sm" onClick={resetFilters}>
                Réinitialiser
              </button>
            )}
          </div>

          {/* Ville */}
          <div className="filter-group">
            <label className="label">Ville</label>
            <select
              className="select"
              value={city}
              onChange={e => setCity(e.target.value)}
            >
              {cityList.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Mode */}
          <div className="filter-group">
            <label className="label">Mode de consultation</label>
            <div className="filter-radio-group">
              {MODE_OPTIONS.map(opt => (
                <label key={opt.value} className={`radio-card ${mode === opt.value ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    className="radio-input"
                    name="mode"
                    value={opt.value}
                    checked={mode === opt.value}
                    onChange={() => setMode(opt.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="filter-group">
            <div className="filter-price-header">
              <label className="label" style={{ margin: 0 }}>Tarif max</label>
              <span className="filter-price-val">{maxPrice} MAD</span>
            </div>
            <input
              type="range"
              className="range-slider"
              min={100}
              max={800}
              step={50}
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              style={{ '--progress': `${pricePercent}%` }}
              aria-label="Tarif maximum"
            />
            <div className="filter-price-labels">
              <span>100 MAD</span>
              <span>800+ MAD</span>
            </div>
          </div>

          {/* Specialties */}
          <div className="filter-group">
            <label className="label">Spécialités</label>
            <div className="filter-check-list">
              {specialtyList.slice(0, 10).map(s => (
                <label key={s} className="checkbox-label">
                  <input
                    type="checkbox"
                    className="checkbox-input"
                    checked={selectedSpecialties.includes(s)}
                    onChange={() => toggleSpecialty(s)}
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="filter-group">
            <label className="label">Langues</label>
            <div className="filter-check-list">
              {LANG_OPTIONS.map(l => (
                <label key={l} className="checkbox-label">
                  <input
                    type="checkbox"
                    className="checkbox-input"
                    checked={selectedLangs.includes(l)}
                    onChange={() => toggleLang(l)}
                  />
                  {l}
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="dir-main">
          {/* Toolbar */}
          <div className="dir-toolbar">
            <div className="dir-toolbar-left">
              <button
                className={`btn btn-ghost btn-sm dir-filter-toggle ${showFilters ? 'active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal size={16} />
                {showFilters ? 'Masquer filtres' : 'Filtres'}
              </button>
              <span className="dir-count">
                <strong>{filtered.length}</strong> thérapeute{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="dir-toolbar-right">
              <label className="label" style={{ margin: 0, whiteSpace: 'nowrap' }}>Trier par :</label>
              <select
                className="select dir-sort-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="dir-active-filters">
              {selectedSpecialties.map(s => (
                <button key={s} className="chip active" onClick={() => toggleSpecialty(s)}>
                  {s} <X size={12} />
                </button>
              ))}
              {selectedLangs.map(l => (
                <button key={l} className="chip active" onClick={() => toggleLang(l)}>
                  {l} <X size={12} />
                </button>
              ))}
              {city !== 'Toutes les villes' && (
                <button className="chip active" onClick={() => setCity('Toutes les villes')}>
                  {city} <X size={12} />
                </button>
              )}
              {mode !== 'all' && (
                <button className="chip active" onClick={() => setMode('all')}>
                  {mode === 'online' ? 'En ligne' : 'En cabinet'} <X size={12} />
                </button>
              )}
              {maxPrice < 800 && (
                <button className="chip active" onClick={() => setMaxPrice(800)}>
                  Max {maxPrice} MAD <X size={12} />
                </button>
              )}
            </div>
          )}

          {/* Grid */}
          {filtered.length > 0 ? (
            <div className="dir-grid">
              {filtered.map((t, i) => (
                <div key={t.id} className={`animate-fade-in-up delay-${Math.min(i, 3)}`}>
                  <TherapistCard therapist={t} />
                </div>
              ))}
            </div>
          ) : (
            <div className="dir-empty">
              <div className="dir-empty-icon">x</div>
              <h3>Aucun thérapeute trouvé</h3>
              <p>Essayez d'ajuster vos filtres ou élargissez votre recherche.</p>
              <button className="btn btn-primary" onClick={resetFilters}>
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
