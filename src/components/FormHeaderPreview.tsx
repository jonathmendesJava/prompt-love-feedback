import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import fiosLogo from "@/assets/fios-logo-public.png";

interface FormHeaderPreviewProps {
  publicTitle?: string;
  publicDescription?: string;
  projectName: string;
  projectDescription?: string;
}

export default function FormHeaderPreview({
  publicTitle,
  publicDescription,
  projectName,
  projectDescription,
}: FormHeaderPreviewProps) {
  const displayTitle = publicTitle || projectName;
  const displayDescription = publicDescription || projectDescription;

  return (
    <Card className="mb-6">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <img src={fiosLogo} alt="FiOS Logo" className="h-10 w-auto" />
          <CardTitle className="text-3xl text-primary">Fios DizAí</CardTitle>
        </div>
        <CardTitle className="text-2xl mt-4">{displayTitle}</CardTitle>
        {displayDescription && (
          <CardDescription className="text-base mt-2">
            {displayDescription}
          </CardDescription>
        )}
      </CardHeader>
    </Card>
  );
}
