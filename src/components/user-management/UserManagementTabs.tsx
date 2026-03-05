import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield, Building, Settings, KeyRound } from "lucide-react";
import { BasicInfoTab } from "./BasicInfoTab";
import { SystemRoleTab } from "./SystemRoleTab";
import { OrganizationTab } from "./OrganizationTab";
import { PermissionsTab } from "./PermissionsTab";
import { AccountActionsTab } from "./AccountActionsTab";

export function UserManagementTabs() {
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState("basic-info");

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
  };

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="basic-info" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Basic Info</span>
          </TabsTrigger>
          <TabsTrigger value="system-role" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">System Role</span>
          </TabsTrigger>
          <TabsTrigger value="organization" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span className="hidden sm:inline">Organization</span>
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Permissions</span>
          </TabsTrigger>
          <TabsTrigger value="account-actions" className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            <span className="hidden sm:inline">Account Actions</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic-info" className="space-y-4">
          <BasicInfoTab userId={selectedUserId} onUserSelect={handleUserSelect} />
        </TabsContent>

        <TabsContent value="system-role" className="space-y-4">
          <SystemRoleTab userId={selectedUserId} />
        </TabsContent>

        <TabsContent value="organization" className="space-y-4">
          <OrganizationTab userId={selectedUserId} />
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <PermissionsTab userId={selectedUserId} />
        </TabsContent>

        <TabsContent value="account-actions" className="space-y-4">
          <AccountActionsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}