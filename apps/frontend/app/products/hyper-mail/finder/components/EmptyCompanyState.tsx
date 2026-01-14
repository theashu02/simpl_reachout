import { CompaySearch } from "@/lib/utils";
import Image from "next/image";

interface EmptyCompanyStateProps {
  title?: string;
  description?: string;
}

export default function EmptyCompanyState({ title = "No Companies Found", description = "Search for a company to get started" }: EmptyCompanyStateProps) {
  return (
    <div className="flex items-center justify-center h-full w-full px-4 py-8">
      <div className="w-full max-w-lg text-center">
        {/* Image */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto mb-6">
          <Image src={CompaySearch} alt="Search for companies" fill className="object-contain" sizes="(max-width: 640px) 192px, 224px" priority />
        </div>

        {/* Text content */}
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">{title}</h2>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-sm mx-auto">{description}</p>
      </div>
    </div>
  );
}
