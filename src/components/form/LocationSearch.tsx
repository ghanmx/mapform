import { useState, useCallback, ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Loader2 } from "lucide-react";
import { searchAddresses } from "@/services/geocodingService";
import { useToast } from "@/hooks/use-toast";
import { debounce } from "lodash";

interface LocationSearchProps {
  label: string;
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  placeholder?: string;
  currentAddress?: string;
  currentLocation?: { lat: number; lng: number } | null;
  icon?: ReactNode;
}

export const LocationSearch = ({ 
  label, 
  onLocationSelect, 
  placeholder = "Search address...",
  currentAddress = "",
  currentLocation,
  icon
}: LocationSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Array<{
    address: string;
    lat: number;
    lon: number;
  }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 3) {
        setSuggestions([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchAddresses(query);
        setSuggestions(results);
      } catch (error) {
        toast({
          title: "Search Error",
          description: "Could not fetch address suggestions",
          variant: "destructive"
        });
      } finally {
        setIsSearching(false);
      }
    }, 500),
    [toast]
  );

  const handleLocationSelect = (suggestion: { address: string; lat: number; lon: number }) => {
    const location = {
      lat: suggestion.lat,
      lng: suggestion.lon,
      address: suggestion.address
    };
    onLocationSelect(location);
    setSuggestions([]);
    setSearchQuery(suggestion.address);
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <div className="relative">
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              {icon}
            </div>
          )}
          <Input
            value={currentAddress || searchQuery}
            onChange={(e) => {
              const value = e.target.value;
              setSearchQuery(value);
              if (value.length >= 3) {
                debouncedSearch(value);
              } else {
                setSuggestions([]);
              }
            }}
            placeholder={placeholder}
            className={`${icon ? 'pl-10' : ''} pr-10 bg-white/95 backdrop-blur-sm border-gray-200 
                       focus:border-primary/50 focus:ring-2 focus:ring-primary/20 
                       placeholder:text-gray-400`}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 hover:bg-primary/10"
            onClick={() => debouncedSearch(searchQuery)}
            disabled={isSearching}
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <Search className="h-4 w-4 text-primary" />
            )}
          </Button>
        </div>
        
        {suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-white/95 backdrop-blur-sm 
                        border border-gray-200 rounded-md shadow-lg divide-y divide-gray-100">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="w-full px-4 py-3 text-left hover:bg-primary/5 flex items-center gap-3 
                         transition-colors group"
                onClick={() => handleLocationSelect(suggestion)}
              >
                <MapPin className="h-4 w-4 text-primary/70 group-hover:text-primary flex-shrink-0" />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 line-clamp-2">
                  {suggestion.address}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};