import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, CheckCircle, Clock, ArrowRight } from "lucide-react";

export default function PatientJourney() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-rose-500" />
            Patient Journey Tracker
          </h1>
          <p className="text-muted-foreground">
            Visual timeline with predictive treatment outcomes
          </p>
        </div>
        <Badge variant="secondary" className="bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700">
          AI Timeline
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Treatment Timeline
          </CardTitle>
          <CardDescription>Interactive patient journey visualization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Timeline Item 1 */}
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Initial Consultation</div>
                <div className="text-sm text-muted-foreground">Complete oral examination and X-rays</div>
                <div className="text-xs text-green-600 font-medium">Completed - March 15, 2024</div>
              </div>
            </div>

            <div className="ml-4 border-l-2 border-gray-200 h-8"></div>

            {/* Timeline Item 2 */}
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Treatment Planning</div>
                <div className="text-sm text-muted-foreground">AI-assisted treatment plan development</div>
                <div className="text-xs text-blue-600 font-medium">In Progress - Expected: March 22, 2024</div>
              </div>
            </div>

            <div className="ml-4 border-l-2 border-gray-200 h-8"></div>

            {/* Timeline Item 3 */}
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <ArrowRight className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Treatment Phase 1</div>
                <div className="text-sm text-muted-foreground">Restorative procedures and cleanings</div>
                <div className="text-xs text-gray-600 font-medium">Scheduled - April 5, 2024</div>
              </div>
            </div>

            <div className="ml-4 border-l-2 border-gray-200 h-8"></div>

            {/* Timeline Item 4 */}
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <ArrowRight className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Follow-up & Maintenance</div>
                <div className="text-sm text-muted-foreground">Regular checkups and preventive care</div>
                <div className="text-xs text-gray-600 font-medium">Ongoing - Every 6 months</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-700">Treatment Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">35%</div>
            <p className="text-sm text-muted-foreground">Overall completion</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-700">Next Appointment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-blue-600">Mar 22</div>
            <p className="text-sm text-muted-foreground">Treatment planning session</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-700">Predicted Outcome</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-purple-600">Excellent</div>
            <p className="text-sm text-muted-foreground">95% success probability</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-lg">
            <p className="text-rose-800 text-sm">
              🚀 Advanced patient journey tracking with AI-powered outcome predictions is being developed for comprehensive care management.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}