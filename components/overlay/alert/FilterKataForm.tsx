import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form, FormField } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import $axios from "@/lib/axios";
import { OVERLAY_FILTER_ENDPOINT } from "@/lib/api-endpoints";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  filter_kata: z.string().optional(),
});

type FilterKataFormProps = {
  initialValue?: string;
};

function FilterKataForm({ initialValue }: FilterKataFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      filter_kata: "",
    },
  });

  React.useEffect(() => {
    if (initialValue !== undefined) {
      form.reset({ filter_kata: initialValue });
    }
  }, [initialValue, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await $axios.put(OVERLAY_FILTER_ENDPOINT, values);
      toast({ title: "Filter kata berhasil disimpan" });
    } catch {
      toast({ title: "Gagal menyimpan filter kata", variant: "destructive" });
    }
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
