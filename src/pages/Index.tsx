import { CalendarIcon, Clock, Star, Users, Shield, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import NewAppointmentForm from "@/components/NewAppointmentForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Your Health, Our Priority
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Experience modern healthcare with our advanced medical practice. Book your appointment today and join thousands of satisfied patients.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <NewAppointmentForm 
              trigger={
                <Button size="lg" className="bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105 px-8 py-6 text-lg">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Book Your Appointment
                </Button>
              }
            />
            
            <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
              <Users className="h-5 w-5 mr-2" />
              Patient Portal
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <CardTitle>Quick Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Schedule appointments in seconds with our streamlined booking system
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-white" />
              </div>
              <CardTitle>Expert Care</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Top-rated healthcare professionals with years of experience
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <CardTitle>Secure & Private</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Your health information is protected with advanced encryption
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <CardTitle>Compassionate Care</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Personalized treatment plans focused on your wellbeing
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-lg p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-center mb-8">Ready to Get Started?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">1. Book Appointment</h3>
              <p className="text-muted-foreground">Choose your preferred date and time</p>
            </div>
            
            <div className="text-center">
              <div className="bg-secondary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="font-semibold mb-2">2. Meet Your Doctor</h3>
              <p className="text-muted-foreground">Receive expert medical consultation</p>
            </div>
            
            <div className="text-center">
              <div className="bg-accent/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">3. Feel Better</h3>
              <p className="text-muted-foreground">Follow your personalized treatment plan</p>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <NewAppointmentForm 
              trigger={
                <Button className="bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl transition-all">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Start Your Health Journey Today
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
