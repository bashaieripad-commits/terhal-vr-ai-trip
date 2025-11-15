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
    <Card className="w-full max-w-4xl mx-auto p-6 shadow-[var(--shadow-lg)] border-2 border-primary/20">
      <Tabs defaultValue="all" className="w-full" onValueChange={setSearchType}>
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="all">{t('search.all')}</TabsTrigger>
          <TabsTrigger value="flights">{t('search.flights')}</TabsTrigger>
          <TabsTrigger value="hotels">{t('search.hotels')}</TabsTrigger>
          <TabsTrigger value="activities">{t('search.activities')}</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                {t('search.destination')}
              </label>
              <Input placeholder={t('search.whereTo')} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                {t('search.checkIn')}
              </label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                {t('search.checkOut')}
              </label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                {t('search.guests')}
              </label>
              <Input type="number" placeholder="2" min="1" />
            </div>
          </div>
          <Button variant="hero" className="w-full" size="lg">
            <Search className="mr-2 h-5 w-5 rtl:ml-2 rtl:mr-0" />
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
