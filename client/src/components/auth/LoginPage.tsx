import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail } from "lucide-react";
import { OmegaLogo } from "@/components/ui/omega-logo";
import { useToast } from "@/hooks/use-toast";

const signInSchema = z.object({
  email: z.string().email("Please use a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").max(24, "Password must be 24 characters or less"),
});

const signUpSchema = z.object({
  email: z.string().email("Please use a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").max(24, "Password must be 24 characters or less"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Whoops, those passwords don't match",
  path: ["confirmPassword"],
});

type SignInForm = z.infer<typeof signInSchema>;
type SignUpForm = z.infer<typeof signUpSchema>;

export default function LoginPage() {
  const { signIn, signInWithEmailAndPassword, signUpWithEmailAndPassword } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");

  const signInForm = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signIn();
    } catch (error) {
      console.error("Google sign in error:", error);
      toast({
        title: "Sign in failed",
        description: "Unable to sign in with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (data: SignInForm) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(data.email, data.password);
    } catch (error: any) {
      console.error("Email sign in error:", error);
      let message = "Unable to sign in. Please check your credentials.";
      if (error.code === "auth/user-not-found") {
        message = "No account found with this email address.";
      } else if (error.code === "auth/wrong-password") {
        message = "Incorrect password.";
      } else if (error.code === "auth/invalid-email") {
        message = "Invalid email address.";
      } else if (error.code === "auth/invalid-credential") {
        message = "Invalid email or password.";
      }
      toast({
        title: "Sign in failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (data: SignUpForm) => {
    try {
      setLoading(true);
      await signUpWithEmailAndPassword(data.email, data.password, data.email.split('@')[0]);
      toast({
        title: "Account created",
        description: "Welcome to Transom! Your account has been created successfully.",
      });
    } catch (error: any) {
      console.error("Email sign up error:", error);
      let message = "Unable to create account. Please try again.";
      if (error.code === "auth/email-already-in-use") {
        message = "An account with this email already exists.";
      } else if (error.code === "auth/weak-password") {
        message = "Password is too weak. Please choose a stronger password.";
      }
      toast({
        title: "Sign up failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
            <OmegaLogo className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Transom</CardTitle>
          <CardDescription className="text-slate-600">
            Transom is the free note-taking app made by writers, for writers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Log In</TabsTrigger>
              <TabsTrigger value="signup">Create Account</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
              <Form {...signInForm}>
                <form onSubmit={signInForm.handleSubmit(handleEmailSignIn)} className="space-y-4">
                  <FormField
                    control={signInForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="Enter your email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signInForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" placeholder="Enter your password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </Form>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              
              <Button 
                onClick={handleGoogleSignIn}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                Google
              </Button>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <Form {...signUpForm}>
                <form onSubmit={signUpForm.handleSubmit(handleEmailSignUp)} className="space-y-4">

                  <FormField
                    control={signUpForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="Enter your email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signUpForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" placeholder="Create a password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signUpForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" placeholder="Confirm your password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </Form>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              
              <Button 
                onClick={handleGoogleSignIn}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                Google
              </Button>
            </TabsContent>
          </Tabs>
          
          <p className="text-xs text-slate-500 text-center mt-4">
            By signing in, you agree to sync your notes with your existing iOS app data
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
