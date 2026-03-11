import { useState } from "react";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";

export const SearchBar = () => {
  const [searchType, setSearchType] = useState("all");
  const { t } = useLanguage();

  return (
    <div 
      className="w-full max-w-4xl mx-auto bg-card/95 backdrop-blur-md rounded-2xl p-6 shadow-[var(--shadow-lg)] border border-border/30"
      role="search"
      aria-label="نموذج البحث | Search form"
    >
      <Tabs defaultValue="all" className="w-full" onValueChange={setSearchType}>
        <TabsList className="grid w-full grid-cols-4 mb-6 bg-muted/50 rounded-xl p-1" role="tablist">
          <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">{t('search.all')}</TabsTrigger>
          <TabsTrigger value="flights" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">{t('search.flights')}</TabsTrigger>
          <TabsTrigger value="hotels" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">{t('search.hotels')}</TabsTrigger>
          <TabsTrigger value="activities" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">{t('search.activities')}</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4" id="all-search" role="tabpanel">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label htmlFor="destination-all" className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                {t('search.destination')}
              </label>
              <Input 
                id="destination-all"
                placeholder={t('search.whereTo')} 
                className="bg-card/80 border-border/50 rounded-xl h-12"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="checkin-all" className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                {t('search.checkIn')}
              </label>
              <Input id="checkin-all" type="date" className="bg-card/80 border-border/50 rounded-xl h-12" />
            </div>
            <div className="space-y-2">
              <label htmlFor="checkout-all" className="text-sm font-medium flex items-center gap-2 text-foreground/80">
                <Calendar className="h-4 w-4 text-primary" />
                {t('search.checkOut')}
              </label>
              <Input id="checkout-all" type="date" className="bg-card/80 border-border/50 rounded-xl h-12" />
            </div>
            <div className="space-y-2">
              <label htmlFor="guests-all" className="text-sm font-medium flex items-center gap-2 text-foreground/80">
                <Users className="h-4 w-4 text-primary" />
                {t('search.guests')}
              </label>
              <Input id="guests-all" type="number" placeholder="2" min="1" className="bg-card/80 border-border/50 rounded-xl h-12" />
            </div>
          </div>
          <Button variant="hero" className="w-full rounded-xl h-12" size="lg">
            <Search className="mr-2 h-5 w-5 rtl:ml-2 rtl:mr-0" />
            {t('search.searchEverything')}
          </Button>
        </TabsContent>

        <TabsContent value="flights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">{t('search.from')}</label>
              <Input placeholder={t('search.departureCity')} className="bg-card/80 border-border/50 rounded-xl h-12" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">{t('search.to')}</label>
              <Input placeholder={t('search.arrivalCity')} className="bg-card/80 border-border/50 rounded-xl h-12" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">{t('search.date')}</label>
              <Input type="date" className="bg-card/80 border-border/50 rounded-xl h-12" />
            </div>
          </div>
          <Button variant="hero" className="w-full rounded-xl h-12" size="lg">
            <Search className="mr-2 h-5 w-5 rtl:ml-2 rtl:mr-0" />
            {t('search.searchFlights')}
          </Button>
        </TabsContent>

        <TabsContent value="hotels" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">{t('search.location')}</label>
              <Input placeholder={t('search.cityOrHotel')} className="bg-card/80 border-border/50 rounded-xl h-12" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">{t('search.checkIn')}</label>
              <Input type="date" className="bg-card/80 border-border/50 rounded-xl h-12" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">{t('search.checkOut')}</label>
              <Input type="date" className="bg-card/80 border-border/50 rounded-xl h-12" />
            </div>
          </div>
          <Button variant="hero" className="w-full rounded-xl h-12" size="lg">
            <Search className="mr-2 h-5 w-5 rtl:ml-2 rtl:mr-0" />
            {t('search.searchHotels')}
          </Button>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">{t('search.location')}</label>
              <Input placeholder={t('search.whereToExplore')} className="bg-card/80 border-border/50 rounded-xl h-12" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">{t('search.date')}</label>
              <Input type="date" className="bg-card/80 border-border/50 rounded-xl h-12" />
            </div>
          </div>
          <Button variant="hero" className="w-full rounded-xl h-12" size="lg">
            <Search className="mr-2 h-5 w-5 rtl:ml-2 rtl:mr-0" />
            {t('search.searchActivities')}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};
