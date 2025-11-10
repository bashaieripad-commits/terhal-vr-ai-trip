import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Calendar, DollarSign, Users, MapPin } from "lucide-react";
import { useState } from "react";

const TripPlanner = () => {
  const [budget, setBudget] = useState([2000]);
  const [duration, setDuration] = useState([5]);

  const interests = [
    "Cultural Heritage",
    "Adventure Sports",
    "Luxury Experience",
    "Family Activities",
    "Beach & Relaxation",
    "Shopping",
    "Culinary",
    "Nature & Wildlife",
  ];

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">AI Trip Planner</h1>
            <p className="text-xl text-muted-foreground">
              Tell us your preferences and let AI create your perfect itinerary
            </p>
          </div>

          {/* Planner Form */}
          <Card className="shadow-[var(--shadow-lg)] border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Trip Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Destination */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Destination
                </label>
                <Input placeholder="Where do you want to go?" className="text-lg" />
              </div>

              {/* Budget */}
              <div className="space-y-4">
                <label className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Budget
                </label>
                <Slider
                  value={budget}
                  onValueChange={setBudget}
                  max={10000}
                  step={100}
                  className="w-full"
                />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">$500</span>
                  <span className="text-2xl font-bold text-primary">${budget[0]}</span>
                  <span className="text-muted-foreground">$10,000</span>
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-4">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Trip Duration
                </label>
                <Slider
                  value={duration}
                  onValueChange={setDuration}
                  max={30}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">1 day</span>
                  <span className="text-2xl font-bold text-primary">
                    {duration[0]} {duration[0] === 1 ? "day" : "days"}
                  </span>
                  <span className="text-muted-foreground">30 days</span>
                </div>
              </div>

              {/* Travel Dates */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date</label>
                  <Input type="date" />
                </div>
              </div>

              {/* Travelers */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Number of Travelers
                </label>
                <Input type="number" placeholder="2" min="1" max="20" />
              </div>

              {/* Interests */}
              <div className="space-y-4">
                <label className="text-sm font-medium">Select Your Interests</label>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <Badge
                      key={interest}
                      variant={selectedInterests.includes(interest) ? "default" : "outline"}
                      className="cursor-pointer px-4 py-2 text-sm hover:scale-105 transition-transform"
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Additional Notes */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Additional Notes (Optional)</label>
                <textarea
                  className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                  placeholder="Any special requirements or preferences..."
                />
              </div>

              {/* Generate Button */}
              <Button variant="hero" size="lg" className="w-full text-lg">
                <Sparkles className="mr-2 h-5 w-5" />
                Generate My Perfect Itinerary
              </Button>
            </CardContent>
          </Card>

          {/* How it Works */}
          <Card className="mt-8 bg-gradient-to-br from-secondary/50 to-accent/10">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                How AI Trip Planner Works
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">1.</span>
                  <span>Share your travel preferences, budget, and interests</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">2.</span>
                  <span>AI analyzes thousands of options to create your personalized itinerary</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">3.</span>
                  <span>Review and customize your day-by-day schedule</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">4.</span>
                  <span>Book everything with one click - flights, hotels, and activities</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TripPlanner;
