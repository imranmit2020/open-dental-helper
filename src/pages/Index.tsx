import { CalendarIcon, Clock, Star, Users, Shield, Heart, Zap, Brain, BarChart3, Mic, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import NewAppointmentForm from "@/components/NewAppointmentForm";

const Index = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            Advanced Dental Practice Management
          </div>
          
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight">
            Transform Your
            <br />
            Dental Experience
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Complete dental management platform for <span className="font-semibold text-primary">practices</span> and <span className="font-semibold text-primary">patients</span>. 
            AI-powered tools, seamless scheduling, and intelligent insights for modern dental care.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <NewAppointmentForm 
              trigger={
                <Button size="lg" className="bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105 px-8 py-6 text-lg group">
                  <CalendarIcon className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                  For Practices - Get Started
                </Button>
              }
            />
            
            <Button variant="outline" size="lg" className="px-8 py-6 text-lg border-2 hover:bg-primary/5">
              <User className="h-5 w-5 mr-2" />
              For Patients - Book Appointment
            </Button>
          </div>
          
          <div className="mt-12 text-sm text-muted-foreground">
            ⭐ 4.9/5 rating from 2,500+ dental practices
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          <Card className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CalendarIcon className="h-8 w-8 text-white" />
              </div>
              <CardTitle>Smart Scheduling</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                AI-powered appointment scheduling with automated reminders and conflict resolution
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <CardTitle>AI Diagnostics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Advanced AI analysis for X-rays, treatment planning, and predictive care insights
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <CardTitle>HIPAA Compliant</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Bank-level security with encrypted patient records and compliance monitoring
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <CardTitle>Practice Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Real-time insights on revenue, patient satisfaction, and practice growth metrics
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Dental Services Section */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center mb-4">Comprehensive Dental Care Management</h2>
          <p className="text-xl text-muted-foreground text-center mb-4 max-w-2xl mx-auto">
            From routine cleanings to complex procedures, manage every aspect of your dental practice
          </p>
          <p className="text-sm text-primary text-center mb-12 font-medium">
            ✨ Services can be customized and configured for each practice
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group">
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-card to-primary/5 group-hover:scale-105">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:rotate-6 transition-transform">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">Preventive Care</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      Routine cleanings & checkups
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      Fluoride treatments
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      Dental sealants
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      Oral cancer screenings
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="group">
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-card to-secondary/5 group-hover:scale-105">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center group-hover:rotate-6 transition-transform">
                      <Heart className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">Restorative Care</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-secondary rounded-full"></div>
                      Dental fillings
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-secondary rounded-full"></div>
                      Crowns & bridges
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-secondary rounded-full"></div>
                      Root canal therapy
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-secondary rounded-full"></div>
                      Dental implants
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="group">
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-card to-accent/5 group-hover:scale-105">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:rotate-6 transition-transform">
                      <Star className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">Cosmetic Dentistry</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                      Teeth whitening
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                      Porcelain veneers
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                      Invisalign treatment
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                      Smile makeovers
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* AI Features Section */}
        <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-3xl p-12 mb-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Brain className="h-4 w-4" />
              Our Comprehensive Platform
            </div>
            <h2 className="text-4xl font-bold mb-4">Next-Generation Dental Technology</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Advanced tools designed for modern dental practices and patient engagement
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                <Mic className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">AI Voice Notes</h3>
                <p className="text-muted-foreground">
                  Dictate treatment notes and patient observations with 99% accuracy. AI automatically organizes and categorizes your voice notes.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-xl flex items-center justify-center flex-shrink-0">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Predictive Analytics</h3>
                <p className="text-muted-foreground">
                  Predict patient no-shows, identify high-risk patients, and optimize treatment plans with machine learning insights.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center flex-shrink-0">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Smart Imaging Analysis</h3>
                <p className="text-muted-foreground">
                  AI-powered X-ray analysis detects cavities, bone loss, and other conditions with unprecedented accuracy.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Automated Workflows</h3>
                <p className="text-muted-foreground">
                  Streamline insurance claims, appointment scheduling, and follow-up care with intelligent automation.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-card rounded-3xl p-12 shadow-xl border">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Modernize Your Dental Practice?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of dental professionals who have transformed their practice with our advanced management platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <NewAppointmentForm 
                trigger={
                  <Button size="lg" className="bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl transition-all px-8 py-6 text-lg">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    Schedule Your First Appointment
                  </Button>
                }
              />
              
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg border-2">
                <Users className="h-5 w-5 mr-2" />
                Request Demo
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-border/50">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">10,000+</div>
                <div className="text-muted-foreground">Happy Patients</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary mb-2">500+</div>
                <div className="text-muted-foreground">Dental Practices</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent mb-2">99.9%</div>
                <div className="text-muted-foreground">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
