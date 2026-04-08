"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import $axios from "@/lib/axios";
import { ME_ENDPOINT } from "@/lib/api-endpoints";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  display_name: z.string().min(1, "Nama tampilan wajib diisi"),
  bio: z.string().max(300).optional(),
});

type UserProfile = {
  username: string;
  display_name?: string;
  profile_image?: string;
  bio?: string;
};

export default function Profile() {
  const { toast } = useToast();
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { display_name: "", bio: "" },
  });

  React.useEffect(() => {
    $axios.get<{ data: UserProfile }>(ME_ENDPOINT).then((res) => {
      const p = res.data.data;
      setProfile(p);
      form.reset({
        display_name: p.display_name ?? "",
        bio: p.bio ?? "",
      });
    });
  }, [form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await $axios.put(ME_ENDPOINT, values);
      toast({ title: "Profil berhasil disimpan" });
    } catch {
      toast({ title: "Gagal menyimpan profil", variant: "destructive" });
    }
  };

  const onUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    setUploading(true);
    try {
      const res = await $axios.put<{ data: { profile_image: string } }>(
        ME_ENDPOINT + "/image",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      setProfile((prev) =>
        prev ? { ...prev, profile_image: res.data.data.profile_image } : prev,
      );
      toast({ title: "Foto profil diperbarui" });
    } catch {
      toast({ title: "Gagal upload foto", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Edit Profil</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile?.profile_image} />
              <AvatarFallback>
                {(profile?.display_name ?? "?").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onUploadPhoto}
            />
            <Button
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? "Mengupload..." : "Ganti Foto"}
            </Button>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <FormField
                name="display_name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Tampilan</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama kamu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="bio"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio (opsional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ceritakan sedikit tentang kamu"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit">Simpan Perubahan</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
