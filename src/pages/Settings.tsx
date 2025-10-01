import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Footer } from "@/components/Footer";
import { Settings as SettingsIcon, Key, Bell, User, Palette, Database } from "lucide-react";
import { GeneralSettings } from "@/components/settings/GeneralSettings";
import { APIKeysSettings } from "@/components/settings/APIKeysSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { DataSettings } from "@/components/settings/DataSettings";

export default function Settings() {
  return (
    <ProtectedRoute>
      <Helmet>
        <title>Settings - AnotherSEOGuru</title>
        <meta name="description" content="Manage your account settings and preferences" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <SettingsContent />
    </ProtectedRoute>
  );
}

function SettingsContent() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 py-6 md:py-8 flex-1">
        <Breadcrumb />

        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="w-8 h-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold">Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your account, preferences, and integrations
          </p>
        </div>

        <Card className="p-4 md:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 gap-2">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <SettingsIcon className="w-4 h-4 hidden sm:block" />
                <span className="text-xs sm:text-sm">General</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4 hidden sm:block" />
                <span className="text-xs sm:text-sm">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="api-keys" className="flex items-center gap-2">
                <Key className="w-4 h-4 hidden sm:block" />
                <span className="text-xs sm:text-sm">API Keys</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="w-4 h-4 hidden sm:block" />
                <span className="text-xs sm:text-sm">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <Palette className="w-4 h-4 hidden sm:block" />
                <span className="text-xs sm:text-sm">Appearance</span>
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center gap-2">
                <Database className="w-4 h-4 hidden sm:block" />
                <span className="text-xs sm:text-sm">Data</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <GeneralSettings />
            </TabsContent>

            <TabsContent value="profile" className="space-y-4">
              <ProfileSettings />
            </TabsContent>

            <TabsContent value="api-keys" className="space-y-4">
              <APIKeysSettings />
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <NotificationSettings />
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4">
              <AppearanceSettings />
            </TabsContent>

            <TabsContent value="data" className="space-y-4">
              <DataSettings />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
