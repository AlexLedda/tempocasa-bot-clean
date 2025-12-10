import React, { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

/**
 * Fuzzy Search Component
 * Ricerca intelligente con tolleranza errori di battitura
 * 
 * @param {Array} items - Array di oggetti da cercare
 * @param {Array} searchKeys - Chiavi su cui cercare (es: ['title', 'description'])
 * @param {Function} renderItem - Funzione per renderizzare ogni item
 * @param {String} placeholder - Placeholder input
 */
export default function FuzzySearch({
    items,
    searchKeys,
    renderItem,
    placeholder = "Cerca..."
}) {
    const [query, setQuery] = useState('');

    // Configure Fuse.js
    const fuse = useMemo(() => {
        const options = {
            keys: searchKeys,
            threshold: 0.3, // 0 = exact match, 1 = match anything
            includeScore: true,
            minMatchCharLength: 2,
            ignoreLocation: true,
            useExtendedSearch: true
        };

        return new Fuse(items, options);
    }, [items, searchKeys]);

    // Perform search
    const results = useMemo(() => {
        if (!query || query.length < 2) {
            return items; // Show all if no query
        }

        const searchResults = fuse.search(query);
        return searchResults.map(result => result.item);
    }, [query, fuse, items]);

    return (
        <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10"
                />
                {query && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                        {results.length} risultat{results.length === 1 ? 'o' : 'i'}
                    </div>
                )}
            </div>

            {/* Results */}
            <div className="space-y-2">
                {results.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>Nessun risultato trovato per "{query}"</p>
                        <p className="text-sm mt-2">Prova con termini diversi</p>
                    </div>
                ) : (
                    results.map((item, index) => renderItem(item, index))
                )}
            </div>
        </div>
    );
}


/**
 * Example Usage:
 * 
 * <FuzzySearch
 *   items={properties}
 *   searchKeys={['title', 'description', 'location']}
 *   placeholder="Cerca immobili..."
 *   renderItem={(property) => (
 *     <PropertyCard key={property.id} property={property} />
 *   )}
 * />
 */
