import type { ComponentType, ReactNode, SVGProps } from "react";

export interface Location {
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

export interface EmployeeCountRange {
  start: number;
  end: number | null;
}

export interface SimilarOrganization {
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

export interface AffiliatedOrganization {
  name: string;
  followerCount: number;
  url: string;
  logoResolutionResult: string;
  industryV2Taxonomy: string;
  industry: string;
  companyId: number;
}

export interface CallToAction {
  displayText: string;
  type: string;
  url: string;
}

export interface FoundedOn {
  month: number | null;
  year: number;
  day: number | null;
}

export interface Company {
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

export type IconType = ComponentType<SVGProps<SVGSVGElement>>;

export type StatItem = {
  icon: IconType;
  label: string;
  value: string;
};

export type QuickLinkItem = {
  id: string;
  href: string;
  label: string;
  icon: ReactNode;
  className?: string;
};

export type CTAButtonProps = {
  company: Company;
  className?: string;
  iconClassName?: string;
};