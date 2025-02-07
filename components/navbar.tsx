import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icons } from "./ui/Icons";
import UserAccountNav from "./users/user-account-nav";
import { User } from "@supabase/supabase-js";
import LogOutButton from "./buttons/logout-button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { createClient } from "@/utils/supabase/server";
import { ArrowBigUp } from "lucide-react";

interface NavbarProps {
  isLoggedIn: boolean;
  user: User | null;
}

export default async function Navbar({ isLoggedIn, user }: NavbarProps) {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Icons.logo className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-gray-800">
                TravelPlan AI
              </span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/#home"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
              >
                Home
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                About
              </Link>
              <Link
                href="/#features"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Features
              </Link>
              <Link
                href="https://rust-polyester-bf7.notion.site/Travel-Itineraries-d2c6c879286945ecb15769e098ad9911"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Docs
              </Link>
              <Link
                href="/itinerary"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Itinerary
              </Link>
              <Link
                href="https://github.com/mohdjami/AI-Travel-Itinerary/tree/main/multi-agent"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Multi-Agent Code
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Dashboard
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isLoggedIn ? (
              <UserAccountNav user={user!} />
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Log in
              </Link>
            )}
          </div>
          <div className="flex items-center sm:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-500">
                  <Icons.menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4">
                  <Link
                    href="/#home"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                  >
                    Home
                  </Link>
                  <Link
                    href="/about"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                  >
                    About
                  </Link>
                  <Link
                    href="/#features"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                  >
                    Features
                  </Link>{" "}
                  <Link
                    href="https://rust-polyester-bf7.notion.site/Travel-Itineraries-d2c6c879286945ecb15769e098ad9911"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                  >
                    Docs
                  </Link>{" "}
                  <Link
                    href="/itinerary"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                  >
                    Itinerary
                  </Link>
                  <Link
                    href="/dashboard"
                    className="block px-2 py-1 text-lg font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    Dashboard
                  </Link>
                  {isLoggedIn ? (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="flex items-center px-2 mb-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={user?.user_metadata.avatar_url}
                            alt="User avatar"
                          />
                          <AvatarFallback>
                            {user?.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-3">
                          <div className="text-base font-medium text-gray-800">
                            {user?.email}
                          </div>
                        </div>
                      </div>
                      <Link
                        href="/profile"
                        className="block px-2 py-1 text-lg font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                      >
                        Profile
                      </Link>
                      <Link
                        href="/profile"
                        className="block px-2 py-1 text-lg font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                      >
                        Settings
                      </Link>
                      <div className="mt-4">
                        <LogOutButton />
                      </div>
                    </div>
                  ) : (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <Link
                        href="/login"
                        className="block px-2 py-1 text-lg font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                      >
                        Log in
                      </Link>
                    </div>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
