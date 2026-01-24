"use client";

import { useParams } from "next/navigation";
import { memo, useMemo } from "react";
import companyData from "./company.json";
import Image from "next/image";
import { Building2, Calendar, ExternalLink, Globe, Info, Layers, MapPin, MoveRight, Sparkles, UserCheck, Users } from "lucide-react";
import { LinkedinLogo } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

// Types based on company.json structure
interface Location {
  country: string;
  city: string;
  geographicArea: string;
  postalCode: string | null;
  line1: string | null;
  line2: string | null;
  description: string | null;
  headquarter?: boolean;
  localizedName?: string;
  latitude?: number;
  longitude?: number;
}

interface EmployeeCountRange {
  start: number;
  end: number | null;
}

interface SimilarOrganization {
  name: string;
  followerCount: number;
  url: string;
  logoResolutionResult: string;
  industryV2Taxonomy: string;
  industry: string;
  originalCoverImage?: string;
  croppedCoverImage?: string;
  companyId: number;
  employeeCountRange: EmployeeCountRange;
  headquarter?: Location;
  universalName: string;
}

interface AffiliatedOrganization {
  name: string;
  followerCount: number;
  url: string;
  logoResolutionResult: string;
  industryV2Taxonomy: string;
  industry: string;
  companyId: number;
}

interface CallToAction {
  displayText: string;
  type: string;
  url: string;
}

interface FoundedOn {
  month: number | null;
  year: number;
  day: number | null;
}

interface Company {
  url: string;
  companyName: string;
  websiteUrl: string;
  industry: string;
  employeeCount: number;
  followerCount: number;
  universalName: string;
  tagline: string;
  description: string;
  companyId: number;
  hashtag: string;
  industryV2Taxonomy: string;
  callToAction: CallToAction;
  employeeCountRange: EmployeeCountRange;
  headquarter: Location;
  foundedOn: FoundedOn;
  logoResolutionResult: string;
  originalCoverImage: string;
  croppedCoverImage: string;
  specialities: string[];
  crunchbaseFundingData: unknown;
  similarOrganizations: SimilarOrganization[];
  affiliatedOrganizationsByEmployees: unknown[];
  affiliatedOrganizationsByShowcases: AffiliatedOrganization[];
  locations: Location[];
}

// Utility functions
const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const formatEmployeeRange = (range: EmployeeCountRange): string => {
  if (range.end === null) return `${formatNumber(range.start)}+`;
  return `${formatNumber(range.start)} - ${formatNumber(range.end)}`;
};

// Component styles - Light mode with cold colors
const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "white", // slate-50
    color: "#1e293b", // slate-800
  },
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "0 16px",
  },
} as const;

// Sub-components
const HeroSection = memo(({ company }: { company: Company }) => (
  <div className="relative w-full h-48 sm:h-56 md:h-72 lg:h-80 overflow-hidden">
    {/* Cover Image */}
    <div
      className="absolute inset-0 bg-cover bg-center"
      style={{
        backgroundImage: `url(${company.originalCoverImage || company.croppedCoverImage})`,
      }}
    >
      <div className="absolute inset-0 bg-slate-800/60 backdrop-blur-sm" />
    </div>

    {/* Company Info Overlay */}
    <div className="relative h-full flex items-end" style={styles.container}>
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 pb-4 sm:pb-6 w-full">
        {/* Logo */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl overflow-hidden border-4 border-white bg-white shadow-xl shrink-0">
          <Image src={company.logoResolutionResult} alt={`${company.companyName} logo`} width={48} height={48} className="w-full h-full object-cover" />
        </div>

        {/* Company Title */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white truncate">{company.companyName}</h1>
          <p className="text-slate-200 text-sm sm:text-base mt-1 line-clamp-2">{company.tagline}</p>
        </div>

        {/* CTA Button */}
        <Button asChild className="hidden sm:inline-flex items-center gap-2 px-5 py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-lg border-0">
          <a href={company.callToAction.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink height={5} width={5} className="h-5 w-5" strokeWidth={2} />
            {company.callToAction.displayText}
          </a>
        </Button>
      </div>
    </div>
  </div>
));

HeroSection.displayName = "HeroSection";

const StatCard = memo(({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="bg-white border-none p-4 sm:p-5">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">{icon}</div>
      <div className="min-w-0">
        <p className="text-slate-500 text-xs sm:text-sm">{label}</p>
        <p className="text-slate-800 font-semibold text-base sm:text-lg truncate">{value}</p>
      </div>
    </div>
  </div>
));

StatCard.displayName = "StatCard";

const StatsSection = memo(({ company }: { company: Company }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-3">
    <StatCard icon={<Users height={5} width={5} className="h-5 w-5" strokeWidth={2} />} label="Employees" value={formatEmployeeRange(company.employeeCountRange)} />
    <StatCard icon={<UserCheck height={5} width={5} className="h-5 w-5" strokeWidth={2} />} label="Followers" value={formatNumber(company.followerCount)} />
    <StatCard icon={<Building2 height={5} width={5} className="h-5 w-5" strokeWidth={2} />} label="Industry" value={company.industryV2Taxonomy} />
    <StatCard icon={<Calendar height={5} width={5} className="h-5 w-5" strokeWidth={2} />} label="Founded" value={company.foundedOn?.year?.toString() || "N/A"} />
  </div>
));

StatsSection.displayName = "StatsSection";

const AboutSection = memo(({ company }: { company: Company }) => (
  <div className="bg-white border-none p-5 sm:p-6">
    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 mb-4 flex items-center gap-2 tracking-wide">
      <Info height={5} width={5} className="h-5 w-5" strokeWidth={2} />
      About
    </h2>
    <p className="text-slate-600 leading-relaxed text-sm sm:text-base whitespace-pre-line">{company.description}</p>
    {company.hashtag && (
      <div className="mt-4 pt-4 border-t border-slate-100">
        <Badge className="text-xs sm:text-sm bg-[#f4f4f4] text-blue-500 cursor-default rounded">{company.hashtag}</Badge>
      </div>
    )}
  </div>
));

AboutSection.displayName = "AboutSection";

const SpecialitiesSection = memo(({ specialities }: { specialities: string[] }) => (
  <div className="bg-white border-none p-5 sm:p-6">
    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 mb-4 flex items-center gap-2 tracking-wide">
      <Sparkles height={5} width={5} className="h-5 w-5" strokeWidth={2} />
      Specialities
    </h2>
    {/* <div className="flex flex-wrap gap-2">
      {specialities.map((specialty, index) => (
        <span key={index} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs sm:text-sm border border-slate-200 hover:bg-slate-200 transition-colors tracking-wide">
          {specialty}
        </span>
      ))}
    </div> */}
    <div className="flex flex-wrap gap-2">
      {specialities.map((specialty, index) => (
        <Badge 
          key={index} 
          variant="secondary" 
          className="text-xs sm:text-sm hover:bg-slate-200 transition-colors cursor-default rounded tracking-wide"
        >
          {specialty}
        </Badge>
      ))}
    </div>
  </div>
));

SpecialitiesSection.displayName = "SpecialitiesSection";

const LocationCard = memo(({ location, isHeadquarter }: { location: Location; isHeadquarter: boolean }) => (
  <div className={`relative overflow-hidden rounded-xl border transition-all ${isHeadquarter ? "bg-indigo-50 border-indigo-200" : "bg-white border-slate-200 hover:border-slate-300"}`}>
    {/* Top accent bar for HQ */}
    {isHeadquarter && <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500" />}

    <div className="p-4">
      {/* Header with city and badge */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {/* Country code badge */}
          <span className={`px-2 py-1 rounded-md text-xs font-bold ${isHeadquarter ? "bg-indigo-100 text-indigo-700 border border-indigo-200" : "bg-slate-100 text-slate-600 border border-slate-200"}`}>{location.country}</span>
          {isHeadquarter && <span className="px-2 py-1 bg-indigo-600 text-white text-xs rounded-md font-semibold shadow-sm">Headquarters</span>}
        </div>
      </div>

      {/* Location details */}
      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isHeadquarter ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500"}`}>
            <MapPin height={5} width={5} className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-800 text-sm leading-tight">{location.city}</h3>
            <p className="text-slate-500 text-xs mt-0.5">{location.geographicArea}</p>
          </div>
        </div>

        {/* Address details */}
        {(location.line1 || location.line2 || location.description) && (
          <div className={`mt-3 pt-3 border-t ${isHeadquarter ? "border-indigo-100" : "border-slate-100"}`}>
            {location.description && <p className="text-slate-600 text-xs mb-1 font-medium">{location.description}</p>}
            {(location.line1 || location.line2) && <p className="text-slate-500 text-xs leading-relaxed">{[location.line1, location.line2].filter(Boolean).join(", ")}</p>}
          </div>
        )}
      </div>
    </div>
  </div>
));

LocationCard.displayName = "LocationCard";

const LocationsSection = memo(({ locations }: { locations: Location[] }) => {
  // Sort locations to show headquarters first
  const sortedLocations = useMemo(() => {
    return [...locations].sort((a, b) => {
      if (a.headquarter && !b.headquarter) return -1;
      if (!a.headquarter && b.headquarter) return 1;
      return 0;
    });
  }, [locations]);

  return (
    <div className="bg-white border-none p-5 sm:p-6">
      <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
          <MapPin height={5} width={5} className="h-5 w-5" strokeWidth={2} />
        </div>
        <span className="font-extrabold tracking-wide text-xl">Locations</span>
        <span className="ml-auto text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
          {locations.length} {locations.length === 1 ? "office" : "offices"}
        </span>
      </h2>
      <div className="space-y-3">
        {sortedLocations.map((location, index) => (
          <LocationCard key={index} location={location} isHeadquarter={location.headquarter || false} />
        ))}
      </div>
    </div>
  );
});

LocationsSection.displayName = "LocationsSection";

const SimilarCompanyCard = memo(({ org }: { org: SimilarOrganization }) => (
  <a href={org.url} target="_blank" rel="noopener noreferrer" className="block p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-slate-300 transition-all group">
    <div className="flex items-center gap-3">
      <Image src={org.logoResolutionResult} alt={`${org.name} logo`} width={48} height={48} className="w-12 h-12 rounded-lg object-cover bg-slate-50 shrink-0 border border-slate-100" />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-slate-800 text-sm truncate group-hover:text-indigo-600 transition-colors">{org.name}</h3>
        <p className="text-slate-500 text-xs truncate">{org.industryV2Taxonomy}</p>
        <p className="text-slate-400 text-xs mt-0.5">{formatNumber(org.followerCount)} followers</p>
      </div>
      <MoveRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0" strokeWidth={2} />
    </div>
  </a>
));

SimilarCompanyCard.displayName = "SimilarCompanyCard";

const SimilarCompaniesSection = memo(({ organizations }: { organizations: SimilarOrganization[] }) => (
  <div className="bg-white border-none p-5 sm:p-6">
    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 mb-4 flex items-center gap-2 tracking-wide">
      <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
      Similar Companies
      <span className="text-sm font-normal text-slate-500">({organizations.length})</span>
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      {organizations.slice(0, 12).map((org, index) => (
        <SimilarCompanyCard key={index} org={org} />
      ))}
    </div>
  </div>
));

SimilarCompaniesSection.displayName = "SimilarCompaniesSection";

const AffiliatedSection = memo(({ organizations }: { organizations: AffiliatedOrganization[] }) => (
  <div className="bg-white border-none p-5 sm:p-6 mb-3">
    <h2 className="text-lg font-extrabold text-slate-800 mb-4 flex items-center gap-2 tracking-wide">
      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
        <Globe height={5} width={5} className="h-5 w-5" strokeWidth={2} />
      </div>
      <span>Affiliated Showcases</span>
    </h2>
    <div className="space-y-2">
      {organizations.map((org, index) => (
        <a key={index} href={org.url} target="_blank" rel="noopener noreferrer" className="group block rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all overflow-hidden">
          <div className="p-4">
            <div className="flex items-center gap-3">
              {/* Logo with subtle shadow */}
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-white shadow-sm ring-1 ring-slate-200">
                  <Image src={org.logoResolutionResult} alt={`${org.name} logo`} width={48} height={48} className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-800 text-sm leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">{org.name}</h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-slate-500 text-xs">{org.industryV2Taxonomy}</span>
                </div>
              </div>

              {/* Arrow */}
              <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 transition-colors" />
              </div>
            </div>

            {/* Stats bar */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Users className="w-3.5 h-3.5" />
                <span className="font-medium text-slate-600">{formatNumber(org.followerCount)}</span>
                <span>followers</span>
              </div>
            </div>
          </div>
        </a>
      ))}
    </div>
  </div>
));

AffiliatedSection.displayName = "AffiliatedSection";

const QuickLinksSection = memo(({ company }: { company: Company }) => (
  <div className="bg-white border-none p-5 sm:p-6">
    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 mb-4 flex items-center gap-2 tracking-wide">
      <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
      Quick Links
    </h2>
    <div className="flex flex-wrap gap-3">
      <Button variant="secondary" size="sm" asChild className="bg-slate-100 hover:bg-slate-200 text-slate-700 border-none shadow-none font-medium">
        <Link href={company.websiteUrl} target="_blank" rel="noopener noreferrer">
          <Globe className="w-4 h-4" />
          Website
        </Link>
      </Button>
      <Button variant="secondary" size="sm" asChild className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-none shadow-none font-medium">
        <Link href={company.url} target="_blank" rel="noopener noreferrer">
          <Image src={LinkedinLogo} alt="LinkedInLogo" width={16} height={16} className="h-4 w-4 rounded" />
          LinkedIn
        </Link>
      </Button>
    </div>
  </div>
));

QuickLinksSection.displayName = "QuickLinksSection";

// Mobile CTA Button
const MobileCTA = memo(({ company }: { company: Company }) => (
  <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/95 border-t border-slate-200 backdrop-blur-sm z-50 shadow-lg">
    <Button asChild className="w-full flex items-center justify-center gap-2 px-5 py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-md border-0">
      <Link href={company.callToAction.url} target="_blank" rel="noopener noreferrer">
        <ExternalLink className="h-4 w-4" />
        {company.callToAction.displayText}
      </Link>
    </Button>
  </div>
));

MobileCTA.displayName = "MobileCTA";

// Main Component
const CompanyDetailPage = () => {
  const params = useParams();
  const companyId = params.companyId as string;

  // In a real app, you would fetch data based on companyId
  // For now, using the first company from the JSON
  const company = useMemo(() => {
    // Try to find company by companyId, fallback to first entry
    const foundCompany = (companyData as Company[]).find((c) => c.companyId.toString() === companyId || c.universalName === companyId);
    return foundCompany || (companyData as Company[])[0];
  }, [companyId]);

  if (!company) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Company Not Found</h2>
          <p className="text-slate-500">The company you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page} className="font-dmsans">
      {/* Hero Section */}
      <HeroSection company={company} />

      {/* Main Content */}
      <div className="py-6 sm:py-8 pb-24 sm:pb-8" style={styles.container}>
        <div className="space-y-6">
          {/* Stats Grid */}
          <StatsSection company={company} />

          {/* Two Column Layout for larger screens */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
            {/* Main Content - 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <AboutSection company={company} />

              {/* Specialities */}
              {company.specialities && company.specialities.length > 0 && <SpecialitiesSection specialities={company.specialities} />}

              {/* Similar Companies */}
              {company.similarOrganizations && company.similarOrganizations.length > 0 && <SimilarCompaniesSection organizations={company.similarOrganizations} />}
            </div>

            {/* Sidebar - 1 column */}
            <div className="space-y-3">
              {/* Quick Links */}
              <QuickLinksSection company={company} />

              {/* Locations */}
              {company.locations && company.locations.length > 0 && <LocationsSection locations={company.locations} />}

              {/* Affiliated Showcases */}
              {company.affiliatedOrganizationsByShowcases && company.affiliatedOrganizationsByShowcases.length > 0 && <AffiliatedSection organizations={company.affiliatedOrganizationsByShowcases} />}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile CTA */}
      <MobileCTA company={company} />
    </div>
  );
};

export default memo(CompanyDetailPage);
