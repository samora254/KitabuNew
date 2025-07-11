import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Home, 
  MessageCircle, 
  TrendingUp, 
  Star,
  Menu,
  X,
  LogOut
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Navigation() {
  const [location] = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Subjects", href: "/subjects", icon: BookOpen },
    { name: "Rafiki AI", href: "/rafiki", icon: MessageCircle },
    { name: "Progress", href: "/progress", icon: TrendingUp },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return location === "/";
    }
    return location.startsWith(href);
  };

  const NavLink = ({ item, mobile = false }: { item: any; mobile?: boolean }) => (
    <Link href={item.href}>
      <button
        className={`${
          mobile
            ? "flex flex-col items-center p-2 w-full"
            : "flex items-center space-x-2 px-4 py-2 rounded-lg"
        } transition-colors ${
          isActive(item.href)
            ? mobile
              ? "text-edu-blue"
              : "text-edu-blue bg-edu-blue/10"
            : mobile
            ? "text-gray-500"
            : "text-readable-dark hover:text-edu-blue hover:bg-gray-100"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <item.icon size={mobile ? 18 : 20} />
        <span className={mobile ? "text-xs mt-1" : "text-sm font-medium"}>
          {item.name}
        </span>
      </button>
    </Link>
  );

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-8 h-8 bg-edu-blue rounded-lg flex items-center justify-center">
                <BookOpen className="text-white" size={16} />
              </div>
              <span className="text-xl font-bold text-readable-dark">Kitabu AI</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {/* XP Display */}
            <div className="hidden md:flex items-center space-x-2">
              <div className="w-8 h-8 bg-achievement-green rounded-full flex items-center justify-center">
                <Star className="text-white" size={12} />
              </div>
              <span className="text-sm text-gray-600">2,450 XP</span>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* User Profile */}
            <div className="relative">
              <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {user?.firstName?.charAt(0) || "U"}
                  </span>
                </div>
                <span className="hidden md:block text-sm font-medium text-readable-dark">
                  {user?.firstName || "User"}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = "/api/logout"}
                  className="hidden md:flex items-center space-x-1 text-gray-500 hover:text-gray-700"
                >
                  <LogOut size={14} />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="flex justify-around py-2">
              {navigation.map((item) => (
                <NavLink key={item.name} item={item} mobile={true} />
              ))}
            </div>
            <div className="border-t border-gray-200 p-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = "/api/logout"}
                className="w-full flex items-center justify-center space-x-2 text-gray-500"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
