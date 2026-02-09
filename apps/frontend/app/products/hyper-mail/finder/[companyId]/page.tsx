"use client";

import { useParams } from "next/navigation";
import { memo, useMemo, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Building2, Calendar, ExternalLink, Globe, Info, Layers, MapPin, MoveRight, Sparkles, UserCheck, Users } from "lucide-react";
import companyData from "./company.json";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, LinkedinLogo } from "@/lib/utils";
import { AffiliatedOrganization, Company, CTAButtonProps, EmployeeCountRange, IconType, Location, QuickLinkItem, SimilarOrganization, StatItem } from "./types";

const PAGE_CLASS = "min-h-screen bg-white text-slate-800 font-dmsans";
const CONTAINER_CLASS = "max-w-[1400px] mx-auto px-4";
const companies = companyData as Company[];

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const formatEmployeeRange = (range: EmployeeCountRange): string => {
  if (range.end === null) return `${formatNumber(range.start)}+`;
  return `${formatNumber(range.start)} - ${formatNumber(range.end)}`;
};

const isNonEmptyArray = <T,>(value?: T[] | null): value is T[] => Boolean(value?.length);

const getCompanyById = (companyId: string, data: Company[]): Company | undefined => {
  if (!data.length) return undefined;
  if (!companyId) return data[0];

  return data.find((company) => company.companyId.toString() === companyId || company.universalName === companyId) ?? data[0];
};

const buildStats = (company: Company): StatItem[] => [
  {
    icon: Users,
    label: "Employees",
    value: formatEmployeeRange(company.employeeCountRange),
  },
  {
    icon: UserCheck,
    label: "Followers",
    value: formatNumber(company.followerCount),
  },
  {
    icon: Building2,
    label: "Industry",
    value: company.industryV2Taxonomy,
  },
  {
    icon: Calendar,
    label: "Founded",
    value: company.foundedOn?.year?.toString() || "N/A",
  },
];

const buildQuickLinks = (company: Company): QuickLinkItem[] => [
  {
    id: "website",
    href: company.websiteUrl,
    label: "Website",
    icon: <Globe className="w-4 h-4" />,
  },
  {
    id: "linkedin",
    href: company.url,
    label: "LinkedIn",
    icon: <Image src={LinkedinLogo} alt="LinkedIn" width={16} height={16} className="h-4 w-4 rounded" />,
    className: "bg-blue-50 hover:bg-blue-100 text-blue-700",
  },
];

const sortLocations = (locations: Location[]): Location[] =>
  [...locations].sort((a, b) => {
    if (a.headquarter && !b.headquarter) return -1;
    if (!a.headquarter && b.headquarter) return 1;
    return 0;
  });

const SectionCard = memo(({ children, className }: { children: ReactNode; className?: string }) => <div className={cn("bg-white border-none p-5 sm:p-6", className)}>{children}</div>);

SectionCard.displayName = "SectionCard";

const CTAButton = memo(({ company, className, iconClassName }: CTAButtonProps) => (
  <Button asChild className={cn("inline-flex items-center gap-2 px-5 py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-lg border-0", className)}>
    <a href={company.callToAction.url} target="_blank" rel="noopener noreferrer">
      <ExternalLink className={cn("h-4 w-4", iconClassName)} strokeWidth={2} />
      {company.callToAction.displayText}
    </a>
  </Button>
));

CTAButton.displayName = "CTAButton";

const QuickLinkButton = memo(({ link }: { link: QuickLinkItem }) => (
  <Button variant="secondary" size="sm" asChild className={cn("bg-slate-100 hover:bg-slate-200 text-slate-700 border-none shadow-none font-medium", link.className)}>
    <Link href={link.href} target="_blank" rel="noopener noreferrer">
      {link.icon}
      {link.label}
    </Link>
  </Button>
));

QuickLinkButton.displayName = "QuickLinkButton";

const HeroSection = memo(({ company }: { company: Company }) => (
  <header className="relative w-full overflow-hidden">
    <div className={cn("py-3 flex items-end", CONTAINER_CLASS)}>
      <div className="flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-end lg:justify-between lg:w-full">
        <div className="flex items-start gap-4 sm:gap-5">
          {/* Logo */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-lg shrink-0">
            <Image src={company.logoResolutionResult} alt={`${company.companyName} logo`} width={112} height={112} className="w-full h-full object-cover" />
          </div>

          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight truncate">{company.companyName}</h1>
            <p className="text-slate-600 text-sm sm:text-base mt-1.5 line-clamp-2">{company.tagline}</p>
          </div>
        </div>

        <CTAButton company={company} className="hidden lg:inline-flex" iconClassName="h-5 w-5" />
      </div>
    </div>
  </header>
));

HeroSection.displayName = "HeroSection";

const StatCard = memo(({ icon: Icon, label, value }: { icon: IconType; label: string; value: string }) => (
  <div className="bg-white border-none p-4 sm:p-5">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-slate-500 text-xs sm:text-sm">{label}</p>
        <p className="text-slate-800 font-semibold text-base sm:text-lg truncate">{value}</p>
      </div>
    </div>
  </div>
));

StatCard.displayName = "StatCard";

const StatsSection = memo(({ company }: { company: Company }) => {
  const stats = useMemo(() => buildStats(company), [company]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-3">
      {stats.map((stat) => (
        <StatCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} />
      ))}
    </div>
  );
});

StatsSection.displayName = "StatsSection";

const AboutSection = memo(({ company }: { company: Company }) => (
  <SectionCard>
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
  </SectionCard>
));

AboutSection.displayName = "AboutSection";

const SpecialitiesSection = memo(({ specialities }: { specialities: string[] }) => (
  <SectionCard>
    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 mb-4 flex items-center gap-2 tracking-wide">
      <Sparkles height={5} width={5} className="h-5 w-5" strokeWidth={2} />
      Specialities
    </h2>
    <div className="flex flex-wrap gap-2">
      {specialities.map((specialty, index) => (
        <Badge key={index} variant="secondary" className="text-xs sm:text-sm hover:bg-slate-200 transition-colors cursor-default rounded tracking-wide">
          {specialty}
        </Badge>
      ))}
    </div>
  </SectionCard>
));

SpecialitiesSection.displayName = "SpecialitiesSection";

const LocationCard = memo(({ location, isHeadquarter }: { location: Location; isHeadquarter: boolean }) => (
  <div className={cn("relative overflow-hidden rounded-xl border transition-all", isHeadquarter ? "bg-indigo-50 border-indigo-200" : "bg-white border-slate-200 hover:border-slate-300")}>
    {isHeadquarter && <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500" />}

    <div className="p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span
            className={cn("px-2 py-1 rounded-md text-xs font-bold", isHeadquarter ? "bg-indigo-100 text-indigo-700 border border-indigo-200" : "bg-slate-100 text-slate-600 border border-slate-200")}
          >
            {location.country}
          </span>
          {isHeadquarter && <span className="px-2 py-1 bg-indigo-600 text-white text-xs rounded-md font-semibold shadow-sm">Headquarters</span>}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", isHeadquarter ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500")}>
            <MapPin height={5} width={5} className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-800 text-sm leading-tight">{location.city}</h3>
            <p className="text-slate-500 text-xs mt-0.5">{location.geographicArea}</p>
          </div>
        </div>

        {/* Address details */}
        {(location.line1 || location.line2 || location.description) && (
          <div className={cn("mt-3 pt-3 border-t", isHeadquarter ? "border-indigo-100" : "border-slate-100")}>
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
  const sortedLocations = useMemo(() => sortLocations(locations), [locations]);

  return (
    <SectionCard>
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
    </SectionCard>
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

const SimilarCompaniesSection = memo(({ organizations }: { organizations: SimilarOrganization[] }) => {
  const visibleOrganizations = useMemo(() => organizations.slice(0, 12), [organizations]);

  return (
    <SectionCard>
      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 mb-4 flex items-center gap-2 tracking-wide">
        <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
        Similar Companies
        <span className="text-sm font-normal text-slate-500">({organizations.length})</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {visibleOrganizations.map((org, index) => (
          <SimilarCompanyCard key={index} org={org} />
        ))}
      </div>
    </SectionCard>
  );
});

SimilarCompaniesSection.displayName = "SimilarCompaniesSection";

const AffiliatedSection = memo(({ organizations }: { organizations: AffiliatedOrganization[] }) => (
  <SectionCard className="mb-3">
    <h2 className="text-lg font-extrabold text-slate-800 mb-4 flex items-center gap-2 tracking-wide">
      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
        <Globe height={5} width={5} className="h-5 w-5" strokeWidth={2} />
      </div>
      <span>Affiliated Showcases</span>
    </h2>
    <div className="space-y-2">
      {organizations.map((org, index) => (
        <a
          key={index}
          href={org.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all overflow-hidden"
        >
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-white shadow-sm ring-1 ring-slate-200">
                  <Image src={org.logoResolutionResult} alt={`${org.name} logo`} width={48} height={48} className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-800 text-sm leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">{org.name}</h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-slate-500 text-xs">{org.industryV2Taxonomy}</span>
                </div>
              </div>

              <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 transition-colors" />
              </div>
            </div>

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
  </SectionCard>
));

AffiliatedSection.displayName = "AffiliatedSection";

const QuickLinksSection = memo(({ company }: { company: Company }) => {
  const links = useMemo(() => buildQuickLinks(company), [company]);

  return (
    <SectionCard>
      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 mb-4 flex items-center gap-2 tracking-wide">
        <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
        Quick Links
      </h2>
      <div className="flex flex-wrap gap-3">
        {links.map((link) => (
          <QuickLinkButton key={link.id} link={link} />
        ))}
      </div>
    </SectionCard>
  );
});

QuickLinksSection.displayName = "QuickLinksSection";

const MobileCTA = memo(({ company }: { company: Company }) => (
  <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/95 border-t border-slate-200 backdrop-blur-sm z-50 shadow-lg">
    <CTAButton company={company} className="w-full justify-center rounded-xl shadow-md" iconClassName="h-4 w-4" />
  </div>
));

MobileCTA.displayName = "MobileCTA";

const NotFoundState = memo(() => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Building2 className="w-8 h-8 text-slate-400" />
      </div>
      <h2 className="text-xl font-semibold text-slate-800 mb-2">Company Not Found</h2>
      <p className="text-slate-500">The company you&apos;re looking for doesn&apos;t exist.</p>
    </div>
  </div>
));

NotFoundState.displayName = "NotFoundState";

const CompanyDetailPage = () => {
  const params = useParams();
  const companyId = typeof params.companyId === "string" ? params.companyId : (params.companyId?.[0] ?? "");

  const company = useMemo(() => getCompanyById(companyId, companies), [companyId]);

  if (!company) {
    return <NotFoundState />;
  }

  const hasSpecialities = isNonEmptyArray(company.specialities);
  const hasSimilarCompanies = isNonEmptyArray(company.similarOrganizations);
  const hasLocations = isNonEmptyArray(company.locations);
  const hasAffiliates = isNonEmptyArray(company.affiliatedOrganizationsByShowcases);

  return (
    <div className={PAGE_CLASS}>
      <HeroSection company={company} />
      <div className="py-6 sm:py-8 pb-24 sm:pb-8">
        <div className={CONTAINER_CLASS}>
          <div className="space-y-6">
            <StatsSection company={company} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
              <div className="lg:col-span-2 space-y-6">
                <AboutSection company={company} />
                {hasSpecialities && <SpecialitiesSection specialities={company.specialities} />}
                {hasSimilarCompanies && <SimilarCompaniesSection organizations={company.similarOrganizations} />}
              </div>
              <div className="space-y-3">
                <QuickLinksSection company={company} />
                {hasLocations && <LocationsSection locations={company.locations} />}
                {hasAffiliates && <AffiliatedSection organizations={company.affiliatedOrganizationsByShowcases} />}
              </div>
            </div>
          </div>
        </div>
      </div>

      <MobileCTA company={company} />
    </div>
  );
};

export default memo(CompanyDetailPage);
