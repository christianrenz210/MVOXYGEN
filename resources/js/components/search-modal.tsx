import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { router } from '@inertiajs/react';
import { Search, X, FileText, Package, Users } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SearchResult {
    id: number;
    type: 'rental' | 'tank' | 'customer';
    title: string;
    subtitle: string;
    url: string;
}

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setQuery('');
            setResults([]);
        }
    }, [isOpen]);

    useEffect(() => {
        const searchTimeout = setTimeout(async () => {
            if (query.length >= 1) {
                setLoading(true);
                try {
                    const response = await fetch(`/search?q=${encodeURIComponent(query)}`);
                    const data = await response.json();
                    setResults(data.results || []);
                } catch (error) {
                    console.error('Search error:', error);
                    setResults([]);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
            }
        }, 150);

        return () => clearTimeout(searchTimeout);
    }, [query]);

    const getResultIcon = (type: string) => {
        switch (type) {
            case 'rental':
                return <FileText className="w-5 h-5 text-blue-500" />;
            case 'tank':
                return <Package className="w-5 h-5 text-green-500" />;
            case 'customer':
                return <Users className="w-5 h-5 text-purple-500" />;
            default:
                return <Search className="w-5 h-5 text-gray-500" />;
        }
    };

    const handleResultClick = (result: SearchResult) => {
        router.visit(result.url);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20 z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[70vh] overflow-hidden flex flex-col">
                {/* Search Input */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <Search className="w-5 h-5 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search rentals, tanks, customers..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="flex-1 border-0 focus-visible:ring-0 text-lg"
                            autoFocus
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="h-8 w-8"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Search Results */}
                <div className="flex-1 overflow-y-auto">
                    {loading && (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    )}

                    {!loading && query.length < 1 && (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <Search className="w-12 h-12 mb-4 opacity-50" />
                            <p className="text-lg">Start typing to search...</p>
                            <p className="text-sm mt-2">Search rentals, tanks, and customers</p>
                        </div>
                    )}

                    {!loading && query.length >= 1 && results.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <FileText className="w-12 h-12 mb-4 opacity-50" />
                            <p className="text-lg">No results found</p>
                            <p className="text-sm mt-2">Try a different search term</p>
                        </div>
                    )}

                    {!loading && results.length > 0 && (
                        <div className="p-2">
                            {results.map((result, index) => (
                                <button
                                    key={`${result.type}-${result.id}-${index}`}
                                    onClick={() => handleResultClick(result)}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
                                >
                                    <div className="flex-shrink-0">
                                        {getResultIcon(result.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{result.title}</p>
                                        <p className="text-sm text-gray-500 truncate">{result.subtitle}</p>
                                    </div>
                                    <div className="text-xs text-gray-400 capitalize bg-gray-100 px-2 py-1 rounded">
                                        {result.type}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Press <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-700 font-mono">Esc</kbd> to close</span>
                        <span>{results.length} results</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
