"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { ImSpinner8 } from "react-icons/im";
import GithubLoginButton from "../buttons/github-login-buton";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});

export default function LoginPage({ data }: { data?: any }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    try {
      setIsLoading(true);
      const supabase = createClient();
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      const { session, user } = authData || {};
      if (error) {
        setIsLoading(false);
        toast({
          title: "Login failed",
          description: error.message,
        });
        if(data.redirectUrl) {
          router.push(`/login?message=${error.message}&redirectUrl=${data.redirectUrl}`);
        }
      } else {
        // router.push(`${} \\/itinerary`);
        if(data.redirectUri) {
          const response = await fetch(data.redirectUrl + `/api/auth`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accessToken: session?.access_token,
            user,
          }),
        });
        //response = await response.json();
        if (!response.ok) {
          const resData = await response.json();
          toast({
            title: "Service Authentication Failed",
            description: resData.message,
            variant: "destructive",
          });
          return;
        }
        router.push(data.redirectUrl);
      }
        router.push("/itinerary");
        router.refresh();
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        setIsLoading(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to login. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container p-10 rounded-md mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to log in to your account
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="john@example.com" {...field} />
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
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading && <ImSpinner8 className="mr-2 h-4 w-4 animate-spin" />}
            Log In
          </Button>
        </form>
      </Form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <GithubLoginButton />
      <p className="px-8 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="hover:text-brand underline underline-offset-4"
        >
          Sign up
        </Link>
      </p>
      {data.message && (
        <div className="bg-red-100 p-4 text-red-700 rounded-md text-sm">
          {data.message}
        </div>
      )}
    </div>
  );
}
