import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Star, Eye, MapPin, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";

const mockResults = [
  {
    id: 1,
    type: "hotel",
    name: "Luxury Desert Resort",
    location: "Riyadh",
    price: 450,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
    hasVR: true,
  },
  {
    id: 2,
    type: "flight",
    name: "Jeddah to Riyadh",
    location: "Saudi Airlines",
    price: 280,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=300&fit=crop",
    hasVR: false,
  },
  {
    id: 3,
    type: "activity",
    name: "Historical Tour",
    location: "Diriyah",
    price: 120,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop",
    hasVR: true,
  },
];

const SearchResults = () => {
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { language } = useLanguage();

  const handleAddToCart = (item: typeof mockResults[0]) => {
    addItem({
      id: `${item.type}-${item.id}-${Date.now()}`,
      type: item.type as "hotel" | "flight" | "activity",
      name: item.name,
      location: item.location,
      price: item.price,
      image: item.image,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-8 px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-80 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Filter Results
                  </h3>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <Input placeholder="Filter by name..." />
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-medium">Price Range</label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={1000}
                    step={50}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <div className="space-y-2">
                    {["All", "Hotels", "Flights", "Activities"].map((type) => (
                      <label key={type} className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" className="rounded" defaultChecked={type === "All"} />
                        <span className="text-sm">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    <Eye className="h-4 w-4 text-primary" />
                    <span className="text-sm">VR Available Only</span>
                  </label>
                </div>

                <Button variant="hero" className="w-full">
                  Apply Filters
                </Button>
              </CardContent>
            </Card>
          </aside>

          {/* Results Grid */}
          <main className="flex-1">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">Search Results</h1>
              <p className="text-muted-foreground">
                Found {mockResults.length} results matching your criteria
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {mockResults.map((result) => (
                <Card
                  key={result.id}
                  className="overflow-hidden hover:shadow-[var(--shadow-lg)] transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={result.image}
                      alt={result.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                    {result.hasVR && (
                      <Badge className="absolute top-2 right-2 bg-primary">
                        <Eye className="h-3 w-3 mr-1" />
                        VR
                      </Badge>
                    )}
                    <Badge className="absolute top-2 left-2 bg-secondary text-secondary-foreground">
                      {result.type}
                    </Badge>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-lg">{result.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {result.location}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{result.rating}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">${result.price}</p>
                        <p className="text-xs text-muted-foreground">per person</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1" variant="outline">
                        Details
                      </Button>
                      <Button className="flex-1" variant="hero">
                        Book Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
