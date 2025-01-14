"use client";
import { useState, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { CalendarIcon } from "lucide-react";
import { addDays, format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import ItineraryDisplay from "../travel-itinerary";
import { motion, AnimatePresence } from "framer-motion";
import { RequestCredits } from "../request-credits";

const formSchema = z
  .object({
    currentLocation: z.string().min(2, {
      message: "Current location must be at least 2 characters.",
    }),
    travelLocation: z.string().min(2, {
      message: "Travel location must be at least 2 characters.",
    }),
    startDate: z.date({
      required_error: "Start date is required.",
    }),
    endDate: z.date({
      required_error: "End date is required.",
    }),
    interests: z.string().min(2, {
      message: "Interests must be at least 2 characters.",
    }),
    budget: z.enum(["low", "medium", "high"], {
      required_error: "Please select a budget range.",
    }),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be after start date.",
    path: ["endDate"],
  });

const LoadingSpinner = () => (
  <motion.div
    className="flex items-center justify-center h-32"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  </motion.div>
);

export default function TravelItineraryForm({
  email,
  initialCredits,
  setCredits,
}: {
  email: string;
  initialCredits: number;
  setCredits: (credits: number) => void;
}) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    itinerary: [],
  });
  const [itineraryKey, setItineraryKey] = useState(0);
  const [showItinerary, setShowItinerary] = useState(false);
  const itineraryRef = useRef(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentLocation: "",
      travelLocation: "",
      interests: "",
      budget: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentLocation: values.currentLocation,
          travelLocation: values.travelLocation,
          interests: values.interests,
          startDate: addDays(values.startDate, 1),
          endDate: addDays(values.endDate, 1),
          budget: values.budget,
        }),
      });
      setName(
        `${values.currentLocation} to ${values.travelLocation} itinerary`
      );
      const data = await response.json();
      if (!response.ok) {
        toast({
          title: data.error,
          description: "Failed to generate itinerary. Please try again.",
          variant: "destructive",
        });
        return;
      }
      setData(data.itinerary);
      setShowItinerary(true);
      setItineraryKey((prevKey) => prevKey + 1);
      setCredits(initialCredits - 1);
      setTimeout(() => {
        if (itineraryRef.current) {
          (itineraryRef.current as HTMLElement).scrollIntoView({
            behavior: "smooth",
          });
        }
      }, 100);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate itinerary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center min-h-full bg-gradient-to-r from-blue-100 to-teal-100 "
      >
        <div className=" mt-4 w-full max-w-md p-8 mb-5 space-y-6 bg-white rounded-lg shadow-xl">
          <h2 className="text-3xl font-bold text-center text-gray-800">
            Travel Itinerary
          </h2>
          <p className="text-center text-gray-600">
            You have {initialCredits} credits remaining.
          </p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 ">
              <FormField
                control={form.control}
                name="currentLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Location</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your current location"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="travelLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Travel Location</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your travel destination"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Budget</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="low" />
                          </FormControl>
                          <FormLabel className="font-normal">Low</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="medium" />
                          </FormControl>
                          <FormLabel className="font-normal">Medium</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="high" />
                          </FormControl>
                          <FormLabel className="font-normal">High</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="interests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interests</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Please let us know your interests."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                Generate Itinerary
              </Button>
            </form>
          </Form>
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <LoadingSpinner />
                <p className="text-center mt-4 text-gray-600">
                  Generating your personalized itinerary...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      <AnimatePresence>
        {showItinerary && (
          <motion.div
            ref={itineraryRef}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5 }}
            className="flex px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 py-6 sm:py-8 md:py-10 items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-teal-100"
          >
            <div className="w-full max-w-7xl">
              <ItineraryDisplay
                id={itineraryKey}
                key={itineraryKey}
                name={name}
                itinerary={data.itinerary}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    { initialCredits ? <></>: <RequestCredits email={email} /> }
    </main>
  );
}
