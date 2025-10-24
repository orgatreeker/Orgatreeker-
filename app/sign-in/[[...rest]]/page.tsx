import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <SignIn 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg"
          }
        }}
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        afterSignInUrl="/"
        afterSignUpUrl="/"
      />
    </div>
  )
}
