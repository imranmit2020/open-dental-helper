import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Star, 
  MessageSquare, 
  Send, 
  TrendingUp, 
  TrendingDown,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Mail,
  Phone,
  Heart
} from "lucide-react";
import { toast } from "sonner";

interface Review {
  id: string;
  platform: 'google' | 'yelp' | 'facebook' | 'healthgrades';
  patientName: string;
  rating: number;
  reviewText: string;
  date: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number;
  responseStatus: 'pending' | 'responded' | 'not_needed';
  aiSuggestedResponse?: string;
  actualResponse?: string;
  keywords: string[];
}

interface ReputationMetrics {
  overallRating: number;
  totalReviews: number;
  responseRate: number;
  averageResponseTime: number;
  sentimentTrend: 'up' | 'down' | 'stable';
  platformRatings: {
    platform: string;
    rating: number;
    count: number;
  }[];
}

export default function ReputationManagement() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const mockMetrics: ReputationMetrics = {
    overallRating: 4.7,
    totalReviews: 847,
    responseRate: 94,
    averageResponseTime: 2.3,
    sentimentTrend: 'up',
    platformRatings: [
      { platform: 'Google', rating: 4.8, count: 423 },
      { platform: 'Yelp', rating: 4.6, count: 234 },
      { platform: 'Facebook', rating: 4.7, count: 156 },
      { platform: 'Healthgrades', rating: 4.5, count: 34 }
    ]
  };

  const mockReviews: Review[] = [
    {
      id: '1',
      platform: 'google',
      patientName: 'Sarah Johnson',
      rating: 5,
      reviewText: 'Excellent service! Dr. Smith was very professional and the staff was incredibly helpful. The office is modern and clean.',
      date: '2024-01-20',
      sentiment: 'positive',
      sentimentScore: 0.92,
      responseStatus: 'pending',
      aiSuggestedResponse: 'Thank you so much for your wonderful review, Sarah! We\'re thrilled to hear about your positive experience with Dr. Smith and our team. Your feedback means the world to us.',
      keywords: ['excellent', 'professional', 'helpful', 'modern', 'clean']
    },
    {
      id: '2',
      platform: 'yelp',
      patientName: 'Mike Davis',
      rating: 2,
      reviewText: 'Long wait time and the treatment was more expensive than quoted. Not happy with the experience.',
      date: '2024-01-18',
      sentiment: 'negative',
      sentimentScore: 0.15,
      responseStatus: 'pending',
      aiSuggestedResponse: 'Hi Mike, we sincerely apologize for not meeting your expectations. We take your feedback seriously and would love to discuss this with you directly. Please contact our office manager at [phone] so we can address your concerns.',
      keywords: ['wait time', 'expensive', 'quoted', 'not happy']
    },
    {
      id: '3',
      platform: 'facebook',
      patientName: 'Lisa Chen',
      rating: 4,
      reviewText: 'Good dental care, friendly staff. The appointment scheduling could be improved.',
      date: '2024-01-15',
      sentiment: 'positive',
      sentimentScore: 0.71,
      responseStatus: 'responded',
      actualResponse: 'Thank you for your feedback, Lisa! We\'re glad you had a positive experience with our dental care and staff. We\'re working on improving our scheduling system.',
      keywords: ['good care', 'friendly', 'scheduling', 'improved']
    }
  ];

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'google': return '🔍';
      case 'yelp': return '🍽️';
      case 'facebook': return '📘';
      case 'healthgrades': return '🏥';
      default: return '⭐';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      case 'neutral': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleSendResponse = (reviewId: string, response: string) => {
    // This would typically send the response via API
    toast.success("Response sent successfully!");
  };

  const generateAutoResponse = (reviewId: string) => {
    // This would typically call an AI service to generate a response
    toast.success("AI response generated!");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">Reputation Management Center</h1>
        <p className="text-lg text-muted-foreground">
          AI-powered review management with automated responses and sentiment analysis
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Star className="w-8 h-8 text-yellow-500" />
              <span className="text-3xl font-bold">{mockMetrics.overallRating}</span>
            </div>
            <p className="text-sm text-muted-foreground">Overall Rating</p>
            <p className="text-xs text-muted-foreground">{mockMetrics.totalReviews} reviews</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="text-3xl font-bold">{mockMetrics.responseRate}%</p>
            <p className="text-sm text-muted-foreground">Response Rate</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <p className="text-3xl font-bold">{mockMetrics.averageResponseTime}h</p>
            <p className="text-sm text-muted-foreground">Avg Response Time</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            {mockMetrics.sentimentTrend === 'up' ? (
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
            ) : (
              <TrendingDown className="w-8 h-8 mx-auto mb-2 text-red-500" />
            )}
            <p className="text-3xl font-bold">
              {mockMetrics.sentimentTrend === 'up' ? '+12%' : '-5%'}
            </p>
            <p className="text-sm text-muted-foreground">Sentiment Trend</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="responses">AI Responses</TabsTrigger>
          <TabsTrigger value="campaigns">Review Campaigns</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Ratings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockMetrics.platformRatings.map((platform, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getPlatformIcon(platform.platform.toLowerCase())}</span>
                      <span className="font-medium">{platform.platform}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="font-bold">{platform.rating}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">({platform.count})</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">5-star review responded</p>
                    <p className="text-xs text-muted-foreground">Sarah Johnson on Google</p>
                  </div>
                  <span className="text-xs text-muted-foreground">2 min ago</span>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Negative review detected</p>
                    <p className="text-xs text-muted-foreground">Mike Davis on Yelp</p>
                  </div>
                  <span className="text-xs text-muted-foreground">1 hour ago</span>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded">
                  <Send className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Review request sent</p>
                    <p className="text-xs text-muted-foreground">15 patients via email</p>
                  </div>
                  <span className="text-xs text-muted-foreground">3 hours ago</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reviews */}
        <TabsContent value="reviews" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockReviews.map((review) => (
                  <div 
                    key={review.id} 
                    className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedReview(review)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getPlatformIcon(review.platform)}</span>
                        <span className="font-medium">{review.patientName}</span>
                        <div className="flex">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <Badge className={getSentimentColor(review.sentiment)}>
                        {review.sentiment}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {review.reviewText}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{review.date}</span>
                      <Badge variant={
                        review.responseStatus === 'responded' ? 'default' :
                        review.responseStatus === 'pending' ? 'destructive' : 'secondary'
                      }>
                        {review.responseStatus}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Selected Review Details */}
            {selectedReview && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-xl">{getPlatformIcon(selectedReview.platform)}</span>
                    Review Response
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Original Review</h4>
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{selectedReview.patientName}</span>
                        <div className="flex">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < selectedReview.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm">{selectedReview.reviewText}</p>
                      
                      <div className="mt-3 flex flex-wrap gap-1">
                        {selectedReview.keywords.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">AI Sentiment Analysis</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">Sentiment Score:</span>
                      <Progress value={selectedReview.sentimentScore * 100} className="flex-1 h-2" />
                      <span className="text-sm font-medium">
                        {Math.round(selectedReview.sentimentScore * 100)}%
                      </span>
                    </div>
                  </div>

                  {selectedReview.responseStatus !== 'responded' && selectedReview.aiSuggestedResponse && (
                    <div>
                      <h4 className="font-medium mb-2">AI Suggested Response</h4>
                      <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                        <p className="text-sm">{selectedReview.aiSuggestedResponse}</p>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button 
                          size="sm" 
                          onClick={() => handleSendResponse(selectedReview.id, selectedReview.aiSuggestedResponse!)}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Send Response
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => generateAutoResponse(selectedReview.id)}
                        >
                          Regenerate
                        </Button>
                      </div>
                    </div>
                  )}

                  {selectedReview.responseStatus === 'responded' && selectedReview.actualResponse && (
                    <div>
                      <h4 className="font-medium mb-2">Your Response</h4>
                      <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
                        <p className="text-sm">{selectedReview.actualResponse}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium mb-2">Custom Response</h4>
                    <Textarea 
                      placeholder="Write a custom response..."
                      rows={4}
                      className="mb-3"
                    />
                    <Button className="w-full">
                      <Send className="w-4 h-4 mr-2" />
                      Send Custom Response
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* AI Responses */}
        <TabsContent value="responses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Response Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-green-500" />
                    Positive Review Template
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    "Thank you so much for your wonderful review! We're thrilled to hear about your positive experience..."
                  </p>
                  <Button size="sm" variant="outline">Edit Template</Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <ThumbsDown className="w-4 h-4 text-red-500" />
                    Negative Review Template
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    "We sincerely apologize for not meeting your expectations. We take your feedback seriously..."
                  </p>
                  <Button size="sm" variant="outline">Edit Template</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Review Campaigns */}
        <TabsContent value="campaigns" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Campaigns</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Post-Treatment Review Request</h4>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Automatically sends review requests 3 days after successful treatments
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span>Sent: 156</span>
                    <span>Response Rate: 23%</span>
                    <span>Avg Rating: 4.6</span>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Preventive Care Reminders</h4>
                    <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Requests reviews from patients who haven't visited in 6+ months
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span>Next Send: Tomorrow</span>
                    <span>Target: 89 patients</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Create New Campaign</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Campaign Type</label>
                  <select className="w-full p-2 border rounded">
                    <option>Post-appointment review request</option>
                    <option>Follow-up for specific treatments</option>
                    <option>Re-engagement for inactive patients</option>
                    <option>Special occasion (birthday, holidays)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Target Audience</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Satisfied patients (4+ star history)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" />
                      <span className="text-sm">Recent treatments (last 30 days)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" />
                      <span className="text-sm">Long-term patients (2+ years)</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Send Method</label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                    <Button variant="outline" size="sm">
                      <Phone className="w-4 h-4 mr-2" />
                      SMS
                    </Button>
                  </div>
                </div>
                
                <Button className="w-full">
                  <Heart className="w-4 h-4 mr-2" />
                  Create Campaign
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}