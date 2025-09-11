"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crown, ArrowRight, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface UpgradePromptProps {
  feature: string
  description: string
  compact?: boolean
  onDismiss?: () => void
}

export function UpgradePrompt({ feature, description, compact = false, onDismiss }: UpgradePromptProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Crown className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-sm">{feature}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link href="/pricing">
              <Button size="sm">
                Upgrade
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
            {onDismiss && (
              <Button variant="ghost" size="sm" onClick={handleDismiss}>
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-primary" />
            <Badge variant="secondary">Pro Feature</Badge>
          </div>
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={handleDismiss}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        <CardTitle className="text-lg">{feature}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/pricing">
          <Button className="w-full">
            Upgrade to Pro
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
