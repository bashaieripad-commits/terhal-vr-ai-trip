import { useState } from "react";
import { Search, MapPin, Calendar, Users, Plane, Hotel, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate, useLocation } from "react-router-dom";

export const SearchBar = () => {
  const [searchType, setSearchType] = useState("all");
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  // Form states
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("");
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [flightDate, setFlightDate] = useState("");
  const [hotelLocation, setHotelLocation] = useState("");
  const [hotelCheckIn, setHotelCheckIn] = useState("");
  const [hotelCheckOut, setHotelCheckOut] = useState("");
  const [activityLocation, setActivityLocation] = useState("");
  const [activityDate, setActivityDate] = useState("");

  const buildSearchParams = () => {
    const params = new URLSearchParams();
    params.set("type", searchType);

    switch (searchType) {
      case "all":
        if (destination) params.set("q", destination);
        if (checkIn) params.set("checkIn", checkIn);
        if (checkOut) params.set("checkOut", checkOut);
        if (guests) params.set("guests", guests);
        break;
      case "flights":
        if (fromCity) params.set("from", fromCity);
        if (toCity) params.set("to", toCity);
        if (flightDate) params.set("date", flightDate);
        break;
      case "hotels":
        if (hotelLocation) params.set("q", hotelLocation);
        if (hotelCheckIn) params.set("checkIn", hotelCheckIn);
        if (hotelCheckOut) params.set("checkOut", hotelCheckOut);
        break;
      case "activities":
        if (activityLocation) params.set("q", activityLocation);
        if (activityDate) params.set("date", activityDate);
        break;
    }
    return params.toString();
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const queryString = buildSearchParams();
    navigate(`/search?${queryString}`);
  };

  const handleTabChange = (value: string) => {
    setSearchType(value);
    // On home page, clicking a specific tab navigates directly to filtered results
    if (isHomePage && value !== "all") {
      navigate(`/search?type=${value}`);
    }
  };

  const tabs = [
    { value: "all", label: t('search.all'), icon: Search },
    { value: "flights", label: t('search.flights'), icon: Plane },
    { value: "hotels", label: t('search.hotels'), icon: Hotel },
    { value: "activities", label: t('search.activities'), icon: Compass },
  ];

  return (
    <div 
      className="w-full max-w-4xl mx-auto bg-card/95 backdrop-blur-md rounded-2xl p-6 shadow-[var(--shadow-lg)] border border-border/30"
      role="search"
      aria-label="نموذج البحث | Search form"
    >
      {/* Custom tab buttons */}
      <div className="grid w-full grid-cols-4 mb-6 bg-muted/50 rounded-xl p-1 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              searchType === tab.value
                ? "bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-card/50"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* All */}
      {searchType === "all" && (
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                {t('search.destination')}
              </label>
              <Input 
                placeholder={t('search.whereTo')} 
                className="bg-card/80 border-border/50 rounded-xl h-12"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                {t('search.checkIn')}
              </label>
              <Input type="date" className="bg-card/80 border-border/50 rounded-xl h-12" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                {t('search.checkOut')}
              </label>
              <Input type="date" className="bg-card/80 border-border/50 rounded-xl h-12" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Users className="h-4 w-4 text-primary" />
                {t('search.guests')}
              </label>
              <Input type="number" placeholder="2" min="1" className="bg-card/80 border-border/50 rounded-xl h-12" value={guests} onChange={(e) => setGuests(e.target.value)} />
            </div>
          </div>
          <Button type="submit" variant="hero" className="w-full rounded-xl h-12" size="lg">
            <Search className="mr-2 h-5 w-5 rtl:ml-2 rtl:mr-0" />
            {t('search.searchEverything')}
          </Button>
        </form>
      )}

      {/* Flights */}
      {searchType === "flights" && (
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">{t('search.from')}</label>
              <Input placeholder={t('search.departureCity')} className="bg-card/80 border-border/50 rounded-xl h-12" value={fromCity} onChange={(e) => setFromCity(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">{t('search.to')}</label>
              <Input placeholder={t('search.arrivalCity')} className="bg-card/80 border-border/50 rounded-xl h-12" value={toCity} onChange={(e) => setToCity(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">{t('search.date')}</label>
              <Input type="date" className="bg-card/80 border-border/50 rounded-xl h-12" value={flightDate} onChange={(e) => setFlightDate(e.target.value)} />
            </div>
          </div>
          <Button type="submit" variant="hero" className="w-full rounded-xl h-12" size="lg">
            <Search className="mr-2 h-5 w-5 rtl:ml-2 rtl:mr-0" />
            {t('search.searchFlights')}
          </Button>
        </form>
      )}

      {/* Hotels */}
      {searchType === "hotels" && (
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">{t('search.location')}</label>
              <Input placeholder={t('search.cityOrHotel')} className="bg-card/80 border-border/50 rounded-xl h-12" value={hotelLocation} onChange={(e) => setHotelLocation(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">{t('search.checkIn')}</label>
              <Input type="date" className="bg-card/80 border-border/50 rounded-xl h-12" value={hotelCheckIn} onChange={(e) => setHotelCheckIn(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">{t('search.checkOut')}</label>
              <Input type="date" className="bg-card/80 border-border/50 rounded-xl h-12" value={hotelCheckOut} onChange={(e) => setHotelCheckOut(e.target.value)} />
            </div>
          </div>
          <Button type="submit" variant="hero" className="w-full rounded-xl h-12" size="lg">
            <Search className="mr-2 h-5 w-5 rtl:ml-2 rtl:mr-0" />
            {t('search.searchHotels')}
          </Button>
        </form>
      )}

      {/* Activities */}
      {searchType === "activities" && (
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">{t('search.location')}</label>
              <Input placeholder={t('search.whereToExplore')} className="bg-card/80 border-border/50 rounded-xl h-12" value={activityLocation} onChange={(e) => setActivityLocation(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">{t('search.date')}</label>
              <Input type="date" className="bg-card/80 border-border/50 rounded-xl h-12" value={activityDate} onChange={(e) => setActivityDate(e.target.value)} />
            </div>
          </div>
          <Button type="submit" variant="hero" className="w-full rounded-xl h-12" size="lg">
            <Search className="mr-2 h-5 w-5 rtl:ml-2 rtl:mr-0" />
            {t('search.searchActivities')}
          </Button>
        </form>
      )}
    </div>
  );
};
