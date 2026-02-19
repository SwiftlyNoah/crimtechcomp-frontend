import { CATEGORIES, type Category } from '../types';

interface CategoryFilterProps {
  activeCategory: Category | null;
  onChange: (category: Category | null) => void;
}

export default function CategoryFilter({ activeCategory, onChange }: CategoryFilterProps) {
  return (
    <div className="category-filter">
      <button
        className={`category-pill${activeCategory === null ? ' active' : ''}`}
        onClick={() => onChange(null)}
      >
        All
      </button>
      {CATEGORIES.map(cat => (
        <button
          key={cat}
          className={`category-pill${activeCategory === cat ? ' active' : ''}`}
          onClick={() => onChange(activeCategory === cat ? null : cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
