import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

const signupSchema = z.object({
  phone: z.string().min(10, "Phone number is required").regex(/^[\+\d\s\-\(\)]+$/, "Invalid phone number format"),
  email: z.string().email("Please enter a valid email").optional().or(z.literal('')),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      phone: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  const signupMutation = useMutation({
    mutationFn: async (data: { phone: string; email?: string; password: string }) => {
      const response = await apiRequest("POST", "/api/signup", data);
      return await response.json();
    },
    onSuccess: (result) => {
      toast({
        title: "Success!",
        description: "Account created successfully. Please log in."
      });
      setLocation("/login");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: SignupForm) => {
    signupMutation.mutate({
      phone: data.phone,
      email: data.email || undefined,
      password: data.password
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>
            Sign up for your health tracker account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input 
                        type="tel" 
                        placeholder="+91 9963123456 or 9963123456" 
                        data-testid="input-phone"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="Enter your email (optional)" 
                        data-testid="input-email"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Enter your password" 
                        data-testid="input-password"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Confirm your password" 
                        data-testid="input-confirm-password"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full" 
                disabled={signupMutation.isPending}
                data-testid="button-signup"
              >
                {signupMutation.isPending ? "Creating Account..." : "Sign Up"}
              </Button>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{" "}
                  <a 
                    href="/login" 
                    className="text-blue-600 hover:underline"
                    data-testid="link-login"
                  >
                    Log in
                  </a>
                </p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}