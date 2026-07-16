import {
  Home, BookOpen, GraduationCap, Users, FileText, Newspaper, Image,
  Camera, Megaphone, PhoneCall, Mail, MapPin, Shield, BookCopy,
  Info, Globe, Calendar, Settings, HelpCircle, ExternalLink,
  User, Heart, Star, Search, Download, UploadCloud, Lock,
  Bell, Clock, AlertCircle, CheckCircle, XCircle, Plus, Edit,
  Trash2, Eye, EyeOff, Link2, MenuIcon, LayoutDashboard, UserRound,
  UserCog, Notebook, Ruler, Quote, Lightbulb, ChevronDown, ChevronRight,
  FileImage, PanelRightOpen, PanelLeftClose, UsersRound, Library,
  Award, BookMarked, Briefcase, Building2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
  Home, BookOpen, GraduationCap, Users, FileText, Newspaper, Image,
  Camera, Megaphone, PhoneCall, Mail, MapPin, Shield, BookCopy,
  Info, Globe, Calendar, Settings, HelpCircle, ExternalLink,
  User, Heart, Star, Search, Download, UploadCloud, Lock,
  Bell, Clock, AlertCircle, CheckCircle, XCircle, Plus, Edit,
  Trash2, Eye, EyeOff, Link2, MenuIcon, LayoutDashboard, UserRound,
  UserCog, Notebook, Ruler, Quote, Lightbulb, ChevronDown, ChevronRight,
  FileImage, PanelRightOpen, PanelLeftClose, UsersRound, Library,
  Award, BookMarked, Briefcase, Building2,
};

export const commonIconNames = [
  "Home", "BookOpen", "GraduationCap", "Users", "FileText",
  "Newspaper", "Image", "Camera", "Megaphone", "PhoneCall",
  "Mail", "MapPin", "Shield", "BookCopy", "Info", "Globe",
  "Calendar", "Settings", "HelpCircle", "User", "Heart",
  "Star", "Bell", "Award", "BookMarked", "Library",
  "Briefcase", "Building2", "UsersRound", "Lock", "Download",
];

export function DynamicIcon({ name, className }: { name?: string | null; className?: string }) {
  if (!name) return null;
  const Icon = iconMap[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}
