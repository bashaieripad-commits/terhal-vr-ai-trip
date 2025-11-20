import { useState } from "react";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";

export const SearchBar = () => {
  const [searchType, setSearchType] = useState("all");
  const { t } = useLanguage();

  return (
    <Card 
      className="w-full max-w-4xl mx-auto p-6 shadow-[var(--shadow-lg)] border-2 border-primary/20"
      role="search"
      aria-label="نموذج البحث | Search form"
    >
      <Tabs defaultValue="all" className="w-full" onValueChange={setSearchType}>
        <TabsList className="grid w-full grid-cols-4 mb-6" role="tablist" aria-label="خيارات البحث | Search options">
          <TabsTrigger value="all" role="tab" aria-controls="all-search">{t('search.all')}</TabsTrigger>
          <TabsTrigger value="flights" role="tab" aria-controls="flights-search">{t('search.flights')}</TabsTrigger>
          <TabsTrigger value="hotels" role="tab" aria-controls="hotels-search">{t('search.hotels')}</TabsTrigger>
          <TabsTrigger value="activities" role="tab" aria-controls="activities-search">{t('search.activities')}</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4" id="all-search" role="tabpanel">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label htmlFor="destination-all" className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                {t('search.destination')}
              </label>
              <Input 
                id="destination-all"
                placeholder={t('search.whereTo')} 
                aria-label={t('search.destination')}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="checkin-all" className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" aria-hidden="true" />
                {t('search.checkIn')}
              </label>
              <Input 
                id="checkin-all"
                type="date" 
                aria-label={t('search.checkIn')}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="checkout-all" className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" aria-hidden="true" />
                {t('search.checkOut')}
              </label>
              <Input 
                id="checkout-all"
                type="date" 
                aria-label={t('search.checkOut')}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="guests-all" className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" aria-hidden="true" />
                {t('search.guests')}
              </label>
              <Input 
                id="guests-all"
                type="number" 
                placeholder="2" 
                min="1" 
                aria-label={t('search.guests')}
              />
            </div>
          </div>
          <Button 
            variant="hero" 
            className="w-full" 
            size="lg"
            aria-label={t('search.searchEverything')}
          >
            <Search className="mr-2 h-5 w-5 rtl:ml-2 rtl:mr-0" aria-hidden="true" />
            {t('search.searchEverything')}
          </Button>
        </TabsContent>

        <TabsContent value="flights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('search.from')}</label>
              <Input placeholder={t('search.departureCity')} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('search.to')}</label>
              <Input placeholder={t('search.arrivalCity')} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('search.date')}</label>
              <Input type="date" />
            </div>
          </div>
          <Button variant="hero" className="w-full" size="lg">
            <Search className="mr-2 h-5 w-5 rtl:ml-2 rtl:mr-0" />
            {t('search.searchFlights')}
          </Button>
        </TabsContent>

        <TabsContent value="hotels" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('search.location')}</label>
              <Input placeholder={t('search.cityOrHotel')} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('search.checkIn')}</label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('search.checkOut')}</label>
              <Input type="date" />
            </div>
          </div>
          <Button variant="hero" className="w-full" size="lg">
            <Search className="mr-2 h-5 w-5 rtl:ml-2 rtl:mr-0" />
            {t('search.searchHotels')}
          </Button>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('search.location')}</label>
              <Input placeholder={t('search.whereToExplore')} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('search.date')}</label>
              <Input type="date" />
            </div>
          </div>
          <Button variant="hero" className="w-full" size="lg">
            <Search className="mr-2 h-5 w-5 rtl:ml-2 rtl:mr-0" />
            {t('search.searchActivities')}
          </Button>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
