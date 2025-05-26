"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// import {} from "@/components/ui/sonner";
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
import React from "react";
import { toast } from "sonner";
import { useAction, useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { tryCatch } from "@/lib/try-catch";
import { Loader } from "lucide-react";

const bankInfoSchema = z.object({
  bankCode: z.string().min(1, { message: "Bank is required." }),
  bankName: z.string().min(1, { message: "Bank name is required." }),
  accountNumber: z.string().length(10, { message: "Account number must be 10 digits." }),
});

type BankInfoValues = z.infer<typeof bankInfoSchema>;

export function PaymentForm({
  defaultValues,
  slug,
}: {
  defaultValues: BankInfoValues;
  slug: string;
}) {
  const form = useForm<BankInfoValues>({
    resolver: zodResolver(bankInfoSchema),
    defaultValues,
    mode: "onChange",
  });

  const [isPending, startTransition] = React.useTransition();
  const [banks, setBanks] = React.useState<Array<{ name: string; code: string }>>([]);
  const [isLoadingBanks, setIsLoadingBanks] = React.useState(true);
  const [isAccountResolvePending, startAccountResolveTransition] = React.useTransition();
  const [accountName, setAccountName] = React.useState<string>("");

  const getBanks = useAction(api.paystack.getBanks);
  const resolveAccountNumber = useAction(api.paystack.resolveAccountNumber);
  const updateStore = useMutation(api.stores.updateStore);

  const bankCode = form.watch("bankCode");
  const accountNumber = form.watch("accountNumber");

  React.useEffect(() => {
    const loadBanks = async () => {
      try {
        const banksData = await getBanks();
        setBanks(banksData);
      } catch (error) {
        toast.error("Failed to load banks");
        console.error(error);
      } finally {
        setIsLoadingBanks(false);
      }
    };

    loadBanks();
  }, [getBanks]);

  React.useEffect(() => {
    const resolveDefaultAccount = async () => {
      if (defaultValues.bankCode && defaultValues.accountNumber?.length === 10) {
        startAccountResolveTransition(async () => {
          try {
            const resolvedAccountName = await resolveAccountNumber({
              accountNumber: defaultValues.accountNumber,
              bankCode: defaultValues.bankCode,
            });

            if (!resolvedAccountName) {
              toast.error("Could not verify account");
              return;
            }

            setAccountName(resolvedAccountName);
          } catch (error) {
            setAccountName("");
            toast.error("Could not verify account");
            console.error(error);
          }
        });
      }
    };

    resolveDefaultAccount();
  }, [defaultValues, resolveAccountNumber]);

  React.useEffect(() => {
    const resolveAccount = async () => {
      if (bankCode && accountNumber?.length === 10) {
        startAccountResolveTransition(async () => {
          try {
            setAccountName("");
            const resolvedAccountName = await resolveAccountNumber({
              accountNumber,
              bankCode,
            });

            if (!resolvedAccountName) {
              toast.error("Could not verify account");
              return;
            }

            setAccountName(resolvedAccountName);
          } catch (error) {
            setAccountName("");
            toast.error("Could not verify account");
            console.error(error);
          }
        });
      }
    };

    resolveAccount();
  }, [bankCode, accountNumber, resolveAccountNumber]);

  async function onSubmit(data: BankInfoValues) {
    startTransition(async () => {
      const { error } = await tryCatch(
        updateStore({
          ...data,
          slug,
        })
      );

      if (error) return void toast.error("Failed to update store. Try again later");
      toast.success("Bank information updated.");
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="bankCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Bank</FormLabel>
              <FormControl>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isLoadingBanks}
                  {...field}
                  onChange={(e) => {
                    const selectedBank = banks.find(bank => bank.code === e.target.value);
                    field.onChange(e.target.value);
                    form.setValue('bankName', selectedBank?.name || '', {
                      shouldValidate: true,
                      shouldDirty: true,
                      shouldTouch: true
                    });
                  }}
                >
                  <option value="">Select a bank</option>
                  {banks.map((bank, index) => (
                    <option key={index} value={bank.code}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="accountNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Number</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  maxLength={10}
                  placeholder="Enter 10-digit account number"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Account Name</FormLabel>
          <FormControl>
            <Input
              value={accountName}
              readOnly
              disabled
              placeholder={isAccountResolvePending ? "Verifying account..." : "Account name will appear here"}
            />
          </FormControl>
        </FormItem>

        <Button disabled={isPending || isAccountResolvePending || accountName == ""} type="submit">
          {isPending && <Loader className="size-4 animate-spin" />} Update Bank Information
        </Button>
      </form>
    </Form>
  );
}
