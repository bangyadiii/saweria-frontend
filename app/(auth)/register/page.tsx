"use client";

import Logo from "@/components/logo";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
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
import { REGISTER_ENDPOINT } from "@/lib/api-endpoints";
import { useToast } from "@/hooks/use-toast";
import $axios from "@/lib/axios";
import { isAxiosError } from "axios";
import { signIn } from "next-auth/react";

const formSchema = z
  .object({
    email: z.string().email(),
    username: z
      .string()
      .min(3)
      .max(255)
      .regex(
        /^[a-zA-Z0-9]+$/,
        "Username can only contain alphanumeric characters"
      ),
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password dan konfirmasi password harus sama",
    path: ["confirmPassword"],
  });

interface RegisterResponse {
  data: {
    user: {
      id: number;
      email: string;
      username: string;
      profileImage: string | null;
      createdAt: Date;
      updatedAt: Date;
      streamKey: string | null;
    };
    token: string;
  };
  message: Array<{ property: string; message: string }>;
}

function Register() {
  const toast = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await $axios.post<RegisterResponse>(REGISTER_ENDPOINT, values);

      signIn("credentials", {
        callbackUrl: "/admin",
        redirect: true,
        email: values.email,
        password: values.password,
      });
    } catch (error) {
      if (!isAxiosError(error) || !error.response) {
        toast.toast({
          title: "An unexpected error occurred.",
          variant: "destructive",
        });
        return;
      }
      const errorData = error.response.data;

      if (!Array.isArray(errorData.message)) {
        toast.toast({
          title: errorData.error || "An unexpected error occurred.",
          variant: "destructive",
        });
        return;
      }

      errorData.message.forEach(
        (err: { property: string; message: string }) => {
          form.setError(err.property as keyof z.infer<typeof formSchema>, {
            type: "value",
            message: err.message,
          });
        }
      );
    }
  };

  return (
    <div className="p-2 w-full md:w-[700px] mx-auto">
      <Card className="bg-gray-50 flex items-center flex-col">
        <div className="flex-1">
          <Logo />
        </div>
        <CardHeader>
          <h1 className="text-3xl font-sans">Register</h1>
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
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Username</FormLabel>
                    <div className="flex items-center gap-x-11">
                      <span className="text-muted-foreground">
                        saweria.com/
                      </span>
                      <FormControl>
                        <Input placeholder="username" {...field} />
                      </FormControl>
                    </div>

                    <FormDescription>
                      Username akan menjadi link saweria kamu
                    </FormDescription>
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
                      <Input placeholder="password" {...field} />
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
                    <FormLabel required>Konfirmasi Password</FormLabel>
                    <FormControl>
                      <Input placeholder="Ulangi password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Register
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Register;
