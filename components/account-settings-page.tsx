"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Loader2, Shield, Trash2, ArrowLeft, Download, Mail, User, Calendar, Key } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getProfile, createProfile, type Profile } from "@/lib/profile-utils"
import { useRouter } from "next/navigation"

interface AccountSettingsPageProps {
  onBack?: () => void
}

export function AccountSettingsPage({ onBack }: AccountSettingsPageProps) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchUserAndProfile()
  }, [])

  const fetchUserAndProfile = async () => {
    setIsLoading(true)
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        console.error("Error getting user:", userError)
        router.push("/auth")
        return
      }

      setUser(user)

      // Fetch or create profile
      let profileData = await getProfile(user.id)
      if (!profileData) {
        const fullName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          `${user.user_metadata?.first_name || ""} ${user.user_metadata?.last_name || ""}`.trim()

        profileData = await createProfile(user.id, user.email || "", fullName)
      }

      if (profileData) {
        setProfile(profileData)
      }
    } catch (error) {
      console.error("Error fetching user and profile:", error)
      setMessage({ type: "error", text: "Failed to load account information" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return

    setIsDeleting(true)
    setMessage(null)
    try {
      // First, try to delete user data from profiles table
      const { error: profileError } = await supabase.from("profiles").delete().eq("id", user.id)

      if (profileError) {
        console.error("Error deleting profile:", profileError)
      }

      // Then delete the auth user
      const { error } = await supabase.auth.admin.deleteUser(user.id)

      if (error) {
        console.error("Error deleting account:", error)
        setMessage({ type: "error", text: "Failed to delete account. Please contact support." })
      } else {
        // Sign out and redirect
        await supabase.auth.signOut()
        router.push("/auth")
      }
    } catch (error) {
      console.error("Error deleting account:", error)
      setMessage({ type: "error", text: "An error occurred while deleting account" })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading account settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
            <p className="text-muted-foreground">Manage your account security and privacy</p>
          </div>
        </div>
        <Badge variant="secondary">Account Management</Badge>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
            <CardDescription>View your account details and basic information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="accountName">Account Name</Label>
                <Input
                  id="accountName"
                  type="text"
                  value={profile?.full_name || "User"}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Update your name in Profile Settings</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountEmail">Email Address</Label>
                <Input id="accountEmail" type="email" value={user?.email || ""} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">Email is managed by Google authentication</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Account Created
                </Label>
                <p className="text-sm text-muted-foreground">
                  {profile ? new Date(profile.created_at).toLocaleDateString() : "Unknown"}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Email Verified
                </Label>
                <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                  {user?.email_confirmed_at ? "Verified" : "Pending"}
                </Badge>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Key className="h-3 w-3" />
                  Auth Provider
                </Label>
                <p className="text-sm text-muted-foreground">
                  {user?.app_metadata?.provider === "google" ? "Google" : "Email"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Security & Privacy
            </CardTitle>
            <CardDescription>Manage your account security and privacy settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Account Status</Label>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                  >
                    Active
                  </Badge>
                  <span className="text-sm text-muted-foreground">Free Plan</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Last Sign In</Label>
                <p className="text-sm text-muted-foreground">
                  {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "Unknown"}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Data Management</Label>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full md:w-auto bg-transparent"
                  onClick={() => setMessage({ type: "error", text: "Data export feature coming soon!" })}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download My Data
                </Button>
                <p className="text-xs text-muted-foreground">Export all your account data in a downloadable format</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Security Actions</Label>
                <div className="flex flex-col md:flex-row gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent"
                    onClick={() =>
                      setMessage({ type: "error", text: "Password change is managed through Google authentication" })
                    }
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive bg-transparent"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Account Permanently?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account "
                          {profile?.full_name || user?.email}" and remove all your data including:
                          <br />
                          <br />• All budget and financial data
                          <br />• Profile information and settings
                          <br />• Account history and preferences
                          <br />
                          <br />
                          Are you sure you want to proceed?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          disabled={isDeleting}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Deleting Account...
                            </>
                          ) : (
                            "Yes, Delete My Account"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <p className="text-xs text-muted-foreground">Account deletion is permanent and cannot be reversed</p>
              </div>
            </div>

            {message && (
              <Alert variant={message.type === "error" ? "destructive" : "default"}>
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
