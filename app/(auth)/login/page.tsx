"use client";

import Logo from "@/components/logo";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { signIn } from "next-auth/react";
import { isAxiosError } from "axios";
import $axios from "@/lib/axios";
import { LoginResponse } from "@/types/user";
import { LOGIN_ENDPOINT } from "@/lib/api-endpoints";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

function Login() {
  const toast = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await $axios.post<LoginResponse>(LOGIN_ENDPOINT, values);
      signIn("credentials", {
        callbackUrl: "/dashboard",
        redirect: true,
        email: values.email,
        password: values.password,
      });
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response) {
        const errorData = error.response.data;
        if (Array.isArray(errorData.message)) {
          // Iterasi pesan error dan set ke field yang relevan
          errorData.message.forEach(
            (err: { property: string; message: string }) => {
              form.setError(err.property as keyof z.infer<typeof formSchema>, {
                type: "value",
                message: err.message,
              });
            }
          );
          return;
        }

        toast.toast({
          title: errorData.error || "An unexpected error occurred.",
        });
        return;
      }

      toast.toast({ title: (error as Error).message || "Something went wrong!" });
    }
  };

  return (
    <div className="mt-12 p-2 w-full md:w-2/5 mx-auto">
      <Card className="bg-gray-50 flex items-center flex-col">
        <div className="flex-1">
          <Logo />
        </div>
        <CardHeader>
          <h1 className="text-3xl font-sans">Login</h1>
        </CardHeader>
        <CardContent className="w-full">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email Address" {...field} />
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
                    <FormLabel required>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="Password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Login;
