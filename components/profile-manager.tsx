"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, User, Mail, Calendar } from "lucide-react"
import { getProfile, updateProfile, createProfile, type Profile } from "@/lib/profile-utils"

interface ProfileManagerProps {
  userId: string
  userEmail: string
  initialProfile?: Profile | null
}

export function ProfileManager({ userId, userEmail, initialProfile }: ProfileManagerProps) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile || null)
  const [fullName, setFullName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
    useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "")
    } else {
      fetchProfile()
    }
  }, [profile])

  const fetchProfile = async () => {
    setIsLoading(true)
    try {
      const profileData = await getProfile(userId)
      if (profileData) {
        setProfile(profileData)
        setFullName(profileData.full_name || "")
      } else {
        const newProfile = await createProfile(userId, userEmail)
        if (newProfile) {
          setProfile(newProfile)
          setFullName(newProfile.full_name || "")
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      setMessage({ type: "error", text: "Failed to load profile" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setIsUpdating(true)
    setMessage(null)

    try {
      const updatedProfile = await updateProfile(userId, {
        full_name: fullName.trim() || null,
      })

      if (updatedProfile) {
        setProfile(updatedProfile)
        setMessage({ type: "success", text: "Profile updated successfully!" })
      } else {
        setMessage({ type: "error", text: "Failed to update profile" })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      setMessage({ type: "error", text: "An error occurred while updating profile" })
    } finally {
      setIsUpdating(false)
    }
  }

  const getUserInitials = () => {
    const name = fullName || userEmail || "User"
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading profile...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Information
        </CardTitle>
        <CardDescription>Manage your account profile and personal information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Profile" />
            <AvatarFallback className="text-lg">{getUserInitials()}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h3 className="text-lg font-medium">{fullName || "User"}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {userEmail}
            </p>
            {profile && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Member since {new Date(profile.created_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={userEmail} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">Email cannot be changed from this interface</p>
          </div>

          {message && (
            <Alert variant={message.type === "error" ? "destructive" : "default"}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={isUpdating} className="w-full">
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Profile...
              </>
            ) : (
              "Update Profile"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
