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

const loginSchema = z.object({
  identifier: z.string().min(1, "Phone number or email is required"),
  password: z.string().min(1, "Password is required")
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: ""
    }
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await apiRequest("POST", "/api/login", data);
      return await response.json();
    },
    onSuccess: (result) => {
      // Store user session
      localStorage.setItem("user", JSON.stringify(result.user));
      
      toast({
        title: "Success!",
        description: "Logged in successfully"
      });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to log in",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Log In</CardTitle>
          <CardDescription>
            Access your health tracker dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number or Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="text" 
                        placeholder="9963123456 or email@example.com" 
                        data-testid="input-identifier"
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
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? "Logging In..." : "Log In"}
              </Button>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{" "}
                  <a 
                    href="/signup" 
                    className="text-blue-600 hover:underline"
                    data-testid="link-signup"
                  >
                    Sign up
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