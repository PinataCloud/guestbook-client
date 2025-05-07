import { useState, useEffect } from 'react';
import { X, ChevronsUpDown } from 'lucide-react';
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  Command,
  CommandInput,
  CommandList,
} from "./ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";

const GIPHY_API_KEY = 'pLURtkhVrUXr3KG25Gy5IvzziV5OrZGa'; // Public API key for demo purposes
const GIPHY_ENDPOINT = 'https://api.giphy.com/v1/gifs/search';

interface GifSearchProps {
  onSelect: (url: string) => void;
  selectedGif: string | null;
}

interface GiphyGif {
  id: string;
  images: {
    fixed_height: {
      url: string;
    };
    original: {
      url: string;
    };
  };
}

export function GifSearch({ onSelect, selectedGif }: GifSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [gifs, setGifs] = useState<GiphyGif[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Search for GIFs when searchQuery changes
  useEffect(() => {
    const searchGifs = async () => {
      if (!searchQuery.trim()) {
        setGifs([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `${GIPHY_ENDPOINT}?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(searchQuery)}&limit=20&rating=g`
        );
        const data = await response.json();
        setGifs(data.data);
        console.log("GIFs fetched:", data.data);
      } catch (error) {
        console.error('Error searching GIFs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search request
    const timer = setTimeout(() => {
      searchGifs();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  function handleSelect(gif: GiphyGif) {
    onSelect(gif.images.original.url);
    setOpen(false);
  }

  function clearSelection() {
    onSelect('');
  }

  const GifResults = () => {
    if (isLoading) {
      return <div className="p-4 text-center text-muted-foreground">Searching...</div>;
    }

    if (!searchQuery.trim()) {
      return <div className="p-4 text-center text-muted-foreground">Start typing to search for GIFs</div>;
    }

    if (gifs.length === 0) {
      return <div className="p-4 text-center text-muted-foreground">No GIFs found. Try a different search.</div>;
    }

    return (
      <div className="grid grid-cols-2 gap-2 p-2">
        {gifs.map((gif) => (
          <div
            key={gif.id}
            onClick={() => handleSelect(gif)}
            className="cursor-pointer overflow-hidden rounded-md border hover:opacity-80 transition-opacity"
          >
            <img
              src={gif.images.fixed_height.url}
              alt="GIF"
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full">
      {selectedGif ? (
        <Card className="overflow-hidden p-0">
          <CardContent className="p-0">
            <div className="relative">
              <img
                src={selectedGif}
                alt="Selected GIF"
                className="w-full max-h-64 object-contain"
              />
              <Button
                size="icon"
                variant="secondary"
                className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
                onClick={clearSelection}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove GIF</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {selectedGif ? "GIF selected" : "Search for a GIF..."}
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Search for GIFs..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                className="h-9"
              />
              <CommandList className="max-h-80 overflow-auto py-2">
                <GifResults />
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
