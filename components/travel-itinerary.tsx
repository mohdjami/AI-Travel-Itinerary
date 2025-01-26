"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { createEvents } from "ics";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Copy, CheckCircle, FileText, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";
import "leaflet/dist/leaflet.css";
import dynamic from "next/dynamic";

const MapComponent = dynamic(
  () => import("@/components/map-component").then((mod) => mod.MapComponent),
  {
    ssr: false,
    loading: () => <div>Loading map...</div>,
  }
);

interface Activity {
  time: string;
  activity: string;
  location: string;
  notes: string;
  cost: string;
  long: number;
  lat: number;
}

interface DayItinerary {
  day: string;
  activities: Activity[];
}

interface ItineraryDisplayProps {
  name?: string;
  itinerary: DayItinerary[];
  id: number;
}

export default function ItineraryDisplay({
  name,
  itinerary,
  id,
}: ItineraryDisplayProps) {
  const [displayedContent, setDisplayedContent] = useState("");
  const [displayedActivities, setDisplayedActivities] = useState<Activity[]>(
    []
  );
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [isStreaming, setIsStreaming] = useState(true);
  const [activeTab, setActiveTab] = useState("preview");
  const [isCopied, setIsCopied] = useState(false);
  const contentRef = useRef("");

  useEffect(() => {
    let content = "";
    itinerary.forEach((day) => {
      content += `Day: ${day.day}\n\n`;
      day.activities.forEach((activity) => {
        content += `Time: ${activity.time}\n`;
        content += `Activity: ${activity.activity}\n`;
        content += `Location: ${activity.location}\n`;
        content += `Notes: ${activity.notes}\n`;
        content += `Cost: ${activity.cost}\n`;
        content += `Coordinates: ${activity.lat}, ${activity.long}\n\n`;
      });
      content += "---\n\n";
    });

    contentRef.current = content;

    let index = 0;
    const interval = setInterval(() => {
      if (index < content.length) {
        setDisplayedContent((prev) => prev + content[index]);
        index++;
      } else {
        clearInterval(interval);
        setIsStreaming(false);
      }
    }, 1);

    return () => clearInterval(interval);
  }, [itinerary]);

  useEffect(() => {
    if (currentDayIndex < itinerary.length) {
      const currentDay = itinerary[currentDayIndex];
      if (currentActivityIndex < currentDay.activities.length) {
        const interval = setInterval(() => {
          setDisplayedActivities((prev) => [
            ...prev,
            currentDay.activities[currentActivityIndex],
          ]);
          setCurrentActivityIndex((prev) => prev + 1);
        }, 100);

        return () => clearInterval(interval);
      } else {
        setCurrentDayIndex((prev) => prev + 1);
        setCurrentActivityIndex(0);
      }
    } else {
      setIsStreaming(false);
    }
  }, [itinerary, currentDayIndex, currentActivityIndex]);

  const handleDownload = (format: "txt" | "pdf" | "ics") => {
    switch (format) {
      case "txt":
        downloadTxt();
        break;
      case "pdf":
        downloadPdf();
        break;
      case "ics":
        downloadIcs();
        break;
    }
  };

  const downloadTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([contentRef.current], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "travel_itinerary.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast({
      title: "Itinerary Downloaded",
      description: "Your itinerary has been downloaded as a text file.",
    });
  };

  const downloadPdf = () => {
    const doc = new jsPDF();
    const splitContent = doc.splitTextToSize(contentRef.current, 180);
    const pageHeight = doc.internal.pageSize.height;
    let cursorY = 20;

    for (let i = 0; i < splitContent.length; i++) {
      if (cursorY > pageHeight - 20) {
        doc.addPage();
        cursorY = 20;
      }
      doc.text(splitContent[i], 15, cursorY);
      cursorY += 7;
    }

    doc.save("travel_itinerary.pdf");
    toast({
      title: "Itinerary Downloaded",
      description: "Your itinerary has been downloaded as a PDF file.",
    });
  };

  const downloadIcs = () => {
    const events = itinerary.flatMap((day) =>
      day.activities.map((activity) => {
        const [year, month, date] = day.day
          .split(" ")[1]
          .split("-")
          .map(Number);
        const [hour, minute] = activity.time.split(":").map(Number);
        return {
          title: activity.activity,
          description: `${activity.notes}\nCost: ${activity.cost}`,
          location: activity.location,
          start: [year, month, date, hour, minute],
          duration: { hours: 1, minutes: 0 },
        };
      })
    );

    createEvents(
      events.map((event) => ({
        ...event,
        start: event.start as [number, number, number, number, number],
        end: [
          ...event.start.slice(0, 3),
          event.start[3] + event.duration.hours,
          event.start[4] + event.duration.minutes,
        ] as [number, number, number, number, number],
      })),
      (error: any, value: BlobPart) => {
        if (error) {
          console.error(error);
          toast({
            title: "Download Failed",
            description: "Failed to generate ICS file. Please try again.",
            variant: "destructive",
          });
          return;
        }

        const element = document.createElement("a");
        const file = new Blob([value], { type: "text/calendar" });
        element.href = URL.createObjectURL(file);
        element.download = "travel_itinerary.ics";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        toast({
          title: "Itinerary Downloaded",
          description: "Your itinerary has been downloaded as an ICS file.",
        });
      }
    );
  };
 const handleDelete = async (id: number) => {  
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/delete-itinerary`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });
    window.location.reload();
  }
  const handleCopy = () => {
    navigator.clipboard
      .writeText(contentRef.current)
      .then(() => {
        setIsCopied(true);
        toast({
          title: "Itinerary Copied",
          description: "Your itinerary has been copied to the clipboard.",
        });
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        toast({
          title: "Copy Failed",
          description: "Failed to copy the itinerary. Please try again.",
          variant: "destructive",
        });
      });
  };

  return (
    <Card className="h-full w-full mx-auto max-w-7xl">
      <CardHeader className="flex justify-between items-center">
        <CardTitle className="text-xl sm:text-2xl md:text-3xl">
          {name || `${itinerary} day itinerary`}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-4 md:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="preview" className="text-sm sm:text-base">
              Preview
            </TabsTrigger>
            <TabsTrigger value="raw" className="text-sm sm:text-base">
              Raw
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="preview"
            className="flex flex-col md:flex-row gap-4 lg:mx-4 xl:mx-8"
          >
            <ScrollArea className="h-[400px] sm:h-[500px] md:h-[600px] w-full rounded-md border p-2 sm:p-4">
              {itinerary ? itinerary.map((day, dayIndex) => (
                <div key={dayIndex} className="mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold mb-2">
                    {day.day}
                  </h2>
                  {displayedActivities
                    .filter(
                      (_, index) =>
                        index < day.activities.length * (dayIndex + 1) &&
                        index >= day.activities.length * dayIndex
                    )
                    .map((activity, actIndex) => (
                      <div
                        className="mb-4 p-2 sm:p-4 bg-secondary rounded-lg flex flex-col md:flex-row"
                        key={actIndex}
                      >
                        <div className="flex-1 md:mr-2 mb-2 md:mb-0">
                          <p className="font-semibold text-sm sm:text-base">
                            {activity.time}
                          </p>
                          <p className="text-base sm:text-lg">
                            {activity.activity}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {activity.location}
                          </p>
                          <p className="text-xs sm:text-sm mt-1 sm:mt-2">
                            {activity.notes}
                          </p>
                          <p className="text-xs sm:text-sm font-semibold mt-1">
                            {activity.cost}
                          </p>
                        </div>
                        {activity.lat && activity.long && (
                          <div className="flex-1 md:ml-2 mt-2 md:mt-0 h-40 sm:h-48 md:h-auto md:w-1/3">
                            <MapComponent
                              lat={activity.lat}
                              lng={activity.long}
                              activity={activity}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )) : <>Loading</>}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="raw" className="mx-2 sm:mx-4 md:mx-8 lg:mx-12">
            <ScrollArea className="h-[400px] sm:h-[500px] md:h-[600px] w-full rounded-md border p-2 sm:p-4">
              <pre className="font-mono text-xs sm:text-sm whitespace-pre-wrap break-words">
                {displayedContent}
              </pre>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-wrap justify-center sm:justify-between gap-2 p-2 sm:p-4">
        <Button
          onClick={() => handleDownload("txt")}
          className="flex items-center gap-2 text-xs sm:text-sm"
        >
          <Download size={14} className="hidden sm:inline" />
          Download TXT
        </Button>
        <Button
          onClick={() => handleDownload("pdf")}
          className="flex items-center gap-2 text-xs sm:text-sm"
        >
          <FileText size={14} className="hidden sm:inline" />
          Download PDF
        </Button>
        <Button
          onClick={() => handleDelete(id)}
          className="flex items-center gap-2 text-xs sm:text-sm"
          variant={"destructive"}
        >
          <Calendar size={14} className="hidden sm:inline" />
          Delete Itinerary
        </Button>
        <Button
          onClick={handleCopy}
          className="flex items-center gap-2 text-xs sm:text-sm"
        >
          {isCopied ? (
            <CheckCircle size={14} className="hidden sm:inline" />
          ) : (
            <Copy size={14} className="hidden sm:inline" />
          )}
          {isCopied ? "Copied!" : "Copy"}
        </Button>
      </CardFooter>
    </Card>
  );
}
