import { useState } from "react";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const SearchBar = () => {
  const [searchType, setSearchType] = useState("all");

  return (
    <Card className="w-full max-w-4xl mx-auto p-6 shadow-[var(--shadow-lg)] border-2 border-primary/20">
      <Tabs defaultValue="all" className="w-full" onValueChange={setSearchType}>
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="flights">Flights</TabsTrigger>
          <TabsTrigger value="hotels">Hotels</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Destination
              </label>
              <Input placeholder="Where to?" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Check-in
              </label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Check-out
              </label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Guests
              </label>
              <Input type="number" placeholder="2" min="1" />
            </div>
          </div>
          <Button variant="hero" className="w-full" size="lg">
            <Search className="mr-2 h-5 w-5" />
            Search Everything
          </Button>
        </TabsContent>

        <TabsContent value="flights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">From</label>
              <Input placeholder="Departure city" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">To</label>
              <Input placeholder="Arrival city" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input type="date" />
            </div>
          </div>
          <Button variant="hero" className="w-full" size="lg">
            <Search className="mr-2 h-5 w-5" />
            Search Flights
          </Button>
        </TabsContent>

        <TabsContent value="hotels" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input placeholder="City or hotel name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Check-in</label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Check-out</label>
              <Input type="date" />
            </div>
          </div>
          <Button variant="hero" className="w-full" size="lg">
            <Search className="mr-2 h-5 w-5" />
            Search Hotels
          </Button>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input placeholder="Where to explore?" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input type="date" />
            </div>
          </div>
          <Button variant="hero" className="w-full" size="lg">
            <Search className="mr-2 h-5 w-5" />
            Search Activities
          </Button>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
