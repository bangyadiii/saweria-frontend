import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  filter_kata: z.string().optional(),
});

function FilterKataForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      filter_kata: "",
    },
  });
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
  };
  return (
    <Card className="bg-gray-50 p-1">
      <CardHeader className="font-sans">
        <CardTitle className="text-xl font-semibold">Filter Kata:</CardTitle>
        <CardDescription>
          Pesan dukungan dan nama pendukung tidak akan ditampilkan jika
          mengandung kata-kata dibawah ini. Pisahkan kata dengan{" "}
          <strong>spasi</strong>.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex gap-x-5">
              <FormField
                name="filter_kata"
                control={form.control}
                render={({ field }) => (
                  <Textarea {...field} value={field.value || ""} />
                )}
              />
            </div>
            <Button type="submit" className="mt-3">
              Simpan
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default FilterKataForm;
