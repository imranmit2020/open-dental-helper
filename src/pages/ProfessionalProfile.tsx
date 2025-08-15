import React, { useEffect, useState, useMemo, lazy, Suspense, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { 
  GraduationCap, 
  Award, 
  Calendar, 
  BookOpen, 
  Users, 
  Globe, 
  Briefcase,
  Star,
  Target,
  TrendingUp,
  Edit3,
  Plus,
  Clock,
  ChevronRight
} from "lucide-react";

// Import components normally for better performance and simpler code
import { ProfessionalProfileForm } from "@/components/ProfessionalProfileForm";
import { CETracker } from "@/components/CETracker";
import { AchievementsBadges } from "@/components/AchievementsBadges";
import { SkillsMatrix } from "@/components/SkillsMatrix";

export default function ProfessionalProfile() {
  const { user } = useAuth();
  const { userRole, hasRole } = useRoleAccess();
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);

  // Check if user is dentist or hygienist
  const isProfessional = hasRole(['dentist', 'hygienist']);

  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['professional-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching professional profile:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!user?.id && isProfessional,
  });

  // Memoize calculations for better performance
  const profileStats = useMemo(() => {
    if (!profile) return { ceProgress: 0, yearsOfExperience: 0, certificationsCount: 0, specializationsCount: 0 };
    
    // Calculate CE progress
    const ceProgress = (() => {
      if (!profile.continuing_education || !Array.isArray(profile.continuing_education)) return 0;
      const currentYear = new Date().getFullYear();
      const thisYearCEs = profile.continuing_education.filter((ce: any) => 
        new Date(ce.completion_date).getFullYear() === currentYear
      );
      const totalHours = thisYearCEs.reduce((sum: number, ce: any) => sum + (ce.hours || 0), 0);
      const requiredHours = userRole === 'dentist' ? 40 : 25;
      return Math.min((totalHours / requiredHours) * 100, 100);
    })();

    // Calculate years of experience
    const yearsOfExperience = (() => {
      if (!profile.experience || !Array.isArray(profile.experience)) return 0;
      return profile.experience.reduce((total: number, exp: any) => {
        const start = new Date(exp.start_date);
        const end = exp.end_date ? new Date(exp.end_date) : new Date();
        const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
        return total + Math.max(0, Number(years) || 0);
      }, 0);
    })();

    return {
      ceProgress,
      yearsOfExperience,
      certificationsCount: Array.isArray(profile.certifications) ? profile.certifications.length : 0,
      specializationsCount: Array.isArray(profile.specializations) ? profile.specializations.length : 0
    };
  }, [profile, userRole]);

  const handleEditSuccess = useCallback(() => {
    refetch();
    setEditMode(false);
    toast({ title: "Profile updated successfully!" });
  }, [refetch, toast]);

  useEffect(() => {
    // SEO
    document.title = "Professional Profile | DentalAI Pro";
    const metaDesc = document.querySelector('meta[name="description"]') || document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    metaDesc.setAttribute('content', 'Manage your professional qualifications, experience, and continuing education.');
    document.head.appendChild(metaDesc);
  }, []);

  if (!isProfessional) {
    return (
      <main className="container mx-auto p-6">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="p-6">
            <h1 className="text-xl font-semibold mb-2">Access Restricted</h1>
            <p className="text-muted-foreground">
              Professional profiles are only available for dentists and hygienists.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Professional Profile</h1>
          <p className="text-muted-foreground">
            Manage your qualifications, experience, and professional development
          </p>
        </div>
        <Button 
          onClick={() => setEditMode(!editMode)}
          variant={editMode ? "secondary" : "default"}
          className="gap-2"
        >
          <Edit3 className="h-4 w-4" />
          {editMode ? "View Mode" : "Edit Profile"}
        </Button>
      </div>

      {editMode ? (
        <ProfessionalProfileForm 
          profile={profile} 
          onSuccess={handleEditSuccess}
          onCancel={() => setEditMode(false)}
        />
      ) : (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Experience</p>
                    <p className="text-xl font-bold">{Math.round(Number(profileStats.yearsOfExperience))} years</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-200 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-emerald-700" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">CE Progress</p>
                    <div className="flex items-center gap-2">
                      <Progress value={Number(profileStats.ceProgress)} className="flex-1 h-2" />
                      <span className="text-sm font-medium">{Math.round(profileStats.ceProgress)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-amber-200 flex items-center justify-center">
                    <Award className="h-5 w-5 text-amber-700" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Certifications</p>
                    <p className="text-xl font-bold">{profileStats.certificationsCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center">
                    <Star className="h-5 w-5 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Specializations</p>
                    <p className="text-xl font-bold">{profileStats.specializationsCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Overview */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center md:items-start">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={profile?.profile_image_url} alt="Professional photo" />
                    <AvatarFallback className="text-lg">
                      {user?.email?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center md:text-left">
                    <h2 className="text-xl font-semibold">
                      Dr. {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
                    </h2>
                    <p className="text-muted-foreground capitalize">{userRole}</p>
                    {profile?.license_number && (
                      <p className="text-sm text-muted-foreground">
                        License: {profile.license_number} ({profile.license_state})
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  {profile?.bio && (
                    <div>
                      <h3 className="font-medium mb-2">Biography</h3>
                      <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
                    </div>
                  )}
                  {profile?.practice_philosophy && (
                    <div>
                      <h3 className="font-medium mb-2">Practice Philosophy</h3>
                      <p className="text-muted-foreground leading-relaxed">{profile.practice_philosophy}</p>
                    </div>
                  )}
                  {Array.isArray(profile?.specializations) && profile.specializations.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2">Specializations</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.specializations.map((spec: string, index: number) => (
                          <Badge key={index} variant="secondary">{spec}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Sections */}
          <Tabs defaultValue="experience" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="certifications">Certifications</TabsTrigger>
              <TabsTrigger value="ce">Continuing Ed</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            <TabsContent value="experience">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Professional Experience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Array.isArray(profile?.experience) && profile.experience.length > 0 ? (
                    <div className="space-y-4">
                      {profile.experience.map((exp: any, index: number) => (
                        <div key={index} className="border-l-2 border-primary/20 pl-4 pb-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold">{exp.position}</h3>
                              <p className="text-primary font-medium">{exp.organization}</p>
                              <p className="text-sm text-muted-foreground">
                                {exp.start_date} - {exp.end_date || 'Present'}
                              </p>
                              {exp.description && (
                                <p className="text-sm text-muted-foreground mt-2">{exp.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No experience recorded yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="education">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Array.isArray(profile?.education) && profile.education.length > 0 ? (
                    <div className="space-y-4">
                      {profile.education.map((edu: any, index: number) => (
                        <div key={index} className="border-l-2 border-emerald-200 pl-4 pb-4">
                          <h3 className="font-semibold">{edu.degree}</h3>
                          <p className="text-emerald-700 font-medium">{edu.institution}</p>
                          <p className="text-sm text-muted-foreground">{edu.year}</p>
                          {edu.gpa && (
                            <p className="text-sm text-muted-foreground">GPA: {edu.gpa}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No education recorded yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="certifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Array.isArray(profile?.certifications) && profile.certifications.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.certifications.map((cert: any, index: number) => (
                        <Card key={index} className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Award className="h-5 w-5 text-amber-700 mt-1 flex-shrink-0" />
                              <div className="flex-1">
                                <h3 className="font-semibold text-amber-900">{cert.name}</h3>
                                <p className="text-sm text-amber-700">{cert.issuer}</p>
                                <p className="text-sm text-amber-600">
                                  Issued: {cert.issue_date}
                                  {cert.expiry_date && ` • Expires: ${cert.expiry_date}`}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No certifications recorded yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ce">
              <CETracker 
                continuingEducation={Array.isArray(profile?.continuing_education) ? profile.continuing_education : []} 
                userRole={userRole}
                ceProgress={profileStats.ceProgress}
              />
            </TabsContent>

            <TabsContent value="skills">
              <SkillsMatrix skillsExpertise={Array.isArray(profile?.skills_expertise) ? profile.skills_expertise : []} />
            </TabsContent>

            <TabsContent value="achievements">
              <AchievementsBadges 
                achievements={Array.isArray(profile?.achievements) ? profile.achievements : []}
                yearsOfExperience={Number(profileStats.yearsOfExperience)}
                ceProgress={Number(profileStats.ceProgress)}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </main>
  );
}