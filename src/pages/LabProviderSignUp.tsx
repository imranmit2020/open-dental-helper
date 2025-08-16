import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  FlaskConical, 
  Building, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Award,
  FileText,
  CheckCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FormData {
  // Company Information
  company_name: string;
  registration_number: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  
  // Capabilities
  specialties: string[];
  certifications: string[];
  equipment_list: string[];
  quality_standards: string[];
  
  // Business Details
  operating_hours: {
    monday: { open: string; close: string; };
    tuesday: { open: string; close: string; };
    wednesday: { open: string; close: string; };
    thursday: { open: string; close: string; };
    friday: { open: string; close: string; };
    saturday: { open: string; close: string; };
    sunday: { open: string; close: string; };
  };
  capacity_info: {
    monthly_capacity: number;
    rush_orders_capacity: number;
    max_concurrent_orders: number;
  };
  turnaround_guarantees: {
    crown: string;
    bridge: string;
    denture: string;
    implant: string;
    orthodontics: string;
  };
  
  // Authentication
  password: string;
  confirm_password: string;
  terms_accepted: boolean;
}

const specialtyOptions = [
  'crown', 'bridge', 'denture', 'implant', 'orthodontics', 
  'veneer', 'inlay', 'onlay', 'retainer', 'nightguard'
];

const certificationOptions = [
  'ISO 13485', 'FDA Registered', 'CE Marking', 'CLIA Certified',
  'CAD/CAM Certified', 'Digital Workflow Certified'
];

const equipmentOptions = [
  'CAD/CAM System', '3D Printer', 'Digital Scanner', 'Milling Machine',
  'Furnace', 'Ceramic Oven', 'Articulator', 'Model Trimmer'
];

const qualityOptions = [
  'ISO 9001', 'Six Sigma', 'Lean Manufacturing', 'Quality Control Documentation',
  'Digital Workflow Standards', 'Material Certification'
];

export default function LabProviderSignUp() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    company_name: '',
    registration_number: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    specialties: [],
    certifications: [],
    equipment_list: [],
    quality_standards: [],
    operating_hours: {
      monday: { open: '08:00', close: '17:00' },
      tuesday: { open: '08:00', close: '17:00' },
      wednesday: { open: '08:00', close: '17:00' },
      thursday: { open: '08:00', close: '17:00' },
      friday: { open: '08:00', close: '17:00' },
      saturday: { open: '08:00', close: '12:00' },
      sunday: { open: '', close: '' }
    },
    capacity_info: {
      monthly_capacity: 0,
      rush_orders_capacity: 0,
      max_concurrent_orders: 0
    },
    turnaround_guarantees: {
      crown: '',
      bridge: '',
      denture: '',
      implant: '',
      orthodontics: ''
    },
    password: '',
    confirm_password: '',
    terms_accepted: false
  });
  const [loading, setLoading] = useState(false);

  const handleArrayToggle = (field: keyof Pick<FormData, 'specialties' | 'certifications' | 'equipment_list' | 'quality_standards'>, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.company_name && formData.contact_person && formData.email && formData.phone;
      case 2:
        return formData.specialties.length > 0;
      case 3:
        return formData.capacity_info.monthly_capacity > 0;
      case 4:
        return formData.password && formData.password === formData.confirm_password && formData.terms_accepted;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      toast.error('Please complete all required fields');
      return;
    }

    setLoading(true);
    try {
      // First, create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/lab-provider-dashboard`,
          data: {
            first_name: formData.contact_person.split(' ')[0],
            last_name: formData.contact_person.split(' ').slice(1).join(' '),
            role: 'lab_provider'
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create lab provider account
        const { data: labAccount, error: labError } = await (supabase as any)
          .from('lab_provider_accounts')
          .insert({
            company_name: formData.company_name,
            registration_number: formData.registration_number,
            contact_person: formData.contact_person,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            website: formData.website,
            specialties: formData.specialties,
            certifications: formData.certifications,
            equipment_list: formData.equipment_list,
            quality_standards: formData.quality_standards,
            operating_hours: formData.operating_hours,
            capacity_info: formData.capacity_info,
            turnaround_guarantees: formData.turnaround_guarantees,
            status: 'pending',
            verification_status: 'unverified'
          })
          .select()
          .single();

        if (labError) throw labError;

        // Create lab provider user relationship
        await (supabase as any)
          .from('lab_provider_users')
          .insert({
            lab_provider_account_id: labAccount.id,
            user_id: authData.user.id,
            role: 'admin'
          });

        toast.success('Registration successful! Please check your email to verify your account.');
        navigate('/lab-provider-dashboard');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const progress = (currentStep / 4) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Card className="shadow-2xl border-0 bg-gradient-to-br from-card to-card/80">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-br from-primary to-primary/80 rounded-full">
                <FlaskConical className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Lab Provider Registration
            </CardTitle>
            <p className="text-muted-foreground">Join our network of dental laboratories</p>
            
            <div className="mt-6">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Step {currentStep} of 4</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Company Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Building className="h-12 w-12 mx-auto text-primary mb-2" />
                  <h3 className="text-xl font-semibold">Company Information</h3>
                  <p className="text-muted-foreground">Tell us about your laboratory</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company_name">Company Name *</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                      placeholder="Premium Dental Lab"
                    />
                  </div>

                  <div>
                    <Label htmlFor="registration_number">Registration Number</Label>
                    <Input
                      id="registration_number"
                      value={formData.registration_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, registration_number: e.target.value }))}
                      placeholder="REG123456"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contact_person">Contact Person *</Label>
                    <Input
                      id="contact_person"
                      value={formData.contact_person}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                      placeholder="Dr. John Smith"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="contact@premiumlab.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://premiumlab.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Business Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="123 Lab Street, City, State, ZIP"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Capabilities & Specialties */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Award className="h-12 w-12 mx-auto text-primary mb-2" />
                  <h3 className="text-xl font-semibold">Capabilities & Specialties</h3>
                  <p className="text-muted-foreground">What services do you offer?</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-medium">Specialties *</Label>
                    <p className="text-sm text-muted-foreground mb-3">Select all services you provide</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {specialtyOptions.map((specialty) => (
                        <div key={specialty} className="flex items-center space-x-2">
                          <Checkbox
                            id={specialty}
                            checked={formData.specialties.includes(specialty)}
                            onCheckedChange={() => handleArrayToggle('specialties', specialty)}
                          />
                          <Label htmlFor={specialty} className="capitalize cursor-pointer">
                            {specialty}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-medium">Certifications</Label>
                    <p className="text-sm text-muted-foreground mb-3">Your quality certifications</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {certificationOptions.map((cert) => (
                        <div key={cert} className="flex items-center space-x-2">
                          <Checkbox
                            id={cert}
                            checked={formData.certifications.includes(cert)}
                            onCheckedChange={() => handleArrayToggle('certifications', cert)}
                          />
                          <Label htmlFor={cert} className="cursor-pointer">
                            {cert}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-medium">Equipment</Label>
                    <p className="text-sm text-muted-foreground mb-3">Available equipment and technology</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {equipmentOptions.map((equipment) => (
                        <div key={equipment} className="flex items-center space-x-2">
                          <Checkbox
                            id={equipment}
                            checked={formData.equipment_list.includes(equipment)}
                            onCheckedChange={() => handleArrayToggle('equipment_list', equipment)}
                          />
                          <Label htmlFor={equipment} className="cursor-pointer">
                            {equipment}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Business Details */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <FileText className="h-12 w-12 mx-auto text-primary mb-2" />
                  <h3 className="text-xl font-semibold">Business Details</h3>
                  <p className="text-muted-foreground">Capacity and turnaround information</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-medium">Capacity Information *</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                      <div>
                        <Label htmlFor="monthly_capacity">Monthly Capacity</Label>
                        <Input
                          id="monthly_capacity"
                          type="number"
                          value={formData.capacity_info.monthly_capacity}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            capacity_info: {
                              ...prev.capacity_info,
                              monthly_capacity: parseInt(e.target.value) || 0
                            }
                          }))}
                          placeholder="100"
                        />
                      </div>

                      <div>
                        <Label htmlFor="rush_capacity">Rush Orders Capacity</Label>
                        <Input
                          id="rush_capacity"
                          type="number"
                          value={formData.capacity_info.rush_orders_capacity}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            capacity_info: {
                              ...prev.capacity_info,
                              rush_orders_capacity: parseInt(e.target.value) || 0
                            }
                          }))}
                          placeholder="10"
                        />
                      </div>

                      <div>
                        <Label htmlFor="concurrent_orders">Max Concurrent Orders</Label>
                        <Input
                          id="concurrent_orders"
                          type="number"
                          value={formData.capacity_info.max_concurrent_orders}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            capacity_info: {
                              ...prev.capacity_info,
                              max_concurrent_orders: parseInt(e.target.value) || 0
                            }
                          }))}
                          placeholder="20"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-medium">Turnaround Time Guarantees</Label>
                    <p className="text-sm text-muted-foreground mb-3">Standard turnaround times in business days</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.keys(formData.turnaround_guarantees).map((type) => (
                        <div key={type}>
                          <Label htmlFor={`turnaround_${type}`} className="capitalize">
                            {type}
                          </Label>
                          <Input
                            id={`turnaround_${type}`}
                            value={formData.turnaround_guarantees[type as keyof typeof formData.turnaround_guarantees]}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              turnaround_guarantees: {
                                ...prev.turnaround_guarantees,
                                [type]: e.target.value
                              }
                            }))}
                            placeholder="5-7 days"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Account Setup */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <CheckCircle className="h-12 w-12 mx-auto text-primary mb-2" />
                  <h3 className="text-xl font-semibold">Account Setup</h3>
                  <p className="text-muted-foreground">Create your login credentials</p>
                </div>

                <div className="space-y-4 max-w-md mx-auto">
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Enter secure password"
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirm_password">Confirm Password *</Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      value={formData.confirm_password}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirm_password: e.target.value }))}
                      placeholder="Confirm your password"
                    />
                  </div>

                  <div className="flex items-start space-x-2 pt-4">
                    <Checkbox
                      id="terms"
                      checked={formData.terms_accepted}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, terms_accepted: !!checked }))}
                    />
                    <Label htmlFor="terms" className="text-sm cursor-pointer">
                      I agree to the Terms of Service and Privacy Policy. I understand that my application will be reviewed and verified before activation.
                    </Label>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentStep < 4 ? (
                <Button onClick={handleNext} disabled={!validateStep(currentStep)}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={!validateStep(4) || loading}
                  className="bg-gradient-to-r from-primary to-primary/80"
                >
                  {loading ? 'Creating Account...' : 'Complete Registration'}
                  <CheckCircle className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>

            {/* Already have an account link */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">
                Already have a lab provider account?
              </p>
              <Button 
                variant="link" 
                onClick={() => navigate('/lab-provider-auth')}
                className="text-primary"
              >
                Sign in to your dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}