import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import fiosLogo from "@/assets/fios-logo-public.png";

interface FormHeaderPreviewProps {
  publicTitle?: string;
  publicDescription?: string;
  projectName: string;
  projectDescription?: string;
  clientBrandName?: string;
  clientLogoUrl?: string;
}

export default function FormHeaderPreview({
  publicTitle,
  publicDescription,
  projectName,
  projectDescription,
  clientBrandName,
  clientLogoUrl,
}: FormHeaderPreviewProps) {
  const displayTitle = publicTitle || projectName;
  const displayDescription = publicDescription || projectDescription;

  return (
    <Card className="mb-6 relative">
      {/* Marca d'água Fios DizAí - Superior Esquerdo */}
      <div className="absolute top-4 left-4 flex items-center gap-2 opacity-60 z-10">
        <img src={fiosLogo} alt="FiOS" className="h-6 w-auto" />
        <span className="text-xs font-medium text-muted-foreground">Fios DizAí</span>
      </div>

      <CardHeader className="text-center pt-12">
        {/* Logo e Nome do Cliente - Centro */}
        {(clientLogoUrl || clientBrandName) && (
          <div className="flex flex-col items-center gap-3 mb-6">
            {clientLogoUrl && (
              <img 
                src={clientLogoUrl} 
                alt="Logo do Cliente" 
                className="h-16 w-auto max-w-xs object-contain"
                onError={(e) => e.currentTarget.style.display = 'none'}
              />
            )}
            {clientBrandName && (
              <CardTitle className="text-3xl text-primary">
                {clientBrandName}
              </CardTitle>
            )}
          </div>
        )}

        {/* Título e Descrição do Formulário */}
        <CardTitle className="text-2xl mt-2">{displayTitle}</CardTitle>
        {displayDescription && (
          <CardDescription className="text-base mt-2">
            {displayDescription}
          </CardDescription>
        )}
      </CardHeader>
    </Card>
  );
}
