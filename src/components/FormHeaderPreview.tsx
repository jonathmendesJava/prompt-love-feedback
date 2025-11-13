import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTheme } from "next-themes";
import fiosLogoLight from "@/assets/fios-logo-light.png";
import fiosLogoDark from "@/assets/fios-logo-dark.png";

interface FormHeaderPreviewProps {
  publicTitle?: string;
  publicDescription?: string;
  projectName: string;
  projectDescription?: string;
  clientBrandName?: string;
  clientLogoUrl?: string;
  logoPosition?: 'top' | 'left' | 'right' | 'bottom' | 'only';
  logoSize?: 'small' | 'medium' | 'large' | 'custom';
  logoCustomHeight?: number;
}

export default function FormHeaderPreview({
  publicTitle,
  publicDescription,
  projectName,
  projectDescription,
  clientBrandName,
  clientLogoUrl,
  logoPosition = 'top',
  logoSize = 'medium',
  logoCustomHeight = 64,
}: FormHeaderPreviewProps) {
  const { theme } = useTheme();
  
  // IMPORTANTE: Não usar projectName como fallback!
  const displayTitle = publicTitle || "";
  const displayDescription = publicDescription || "";
  
  const fiosLogo = theme === "dark" ? fiosLogoDark : fiosLogoLight;
  
  // Calcular altura da logo
  const logoHeightMap = { small: 48, medium: 64, large: 96, custom: logoCustomHeight };
  const logoHeight = logoHeightMap[logoSize];
  
  // Determinar layout
  const showName = logoPosition !== 'only' && clientBrandName;
  const isHorizontal = logoPosition === 'left' || logoPosition === 'right';

  return (
    <Card className="mb-6 relative">
      {/* Marca d'água FiOS DizAí - Superior Esquerdo */}
      <div className="absolute top-4 left-4 flex items-center gap-2 opacity-60 z-10">
        <img src={fiosLogo} alt="FiOS" className="h-6 w-auto" />
        <span className="text-xs font-medium text-muted-foreground">FiOS DizAí</span>
      </div>

      <CardHeader className="text-center pt-12">
        {/* Logo e Nome do Cliente */}
        {(clientLogoUrl || clientBrandName) && (
          <div className={`flex items-center justify-center gap-4 mb-6 ${
            isHorizontal ? 'flex-row' : 'flex-col'
          } ${logoPosition === 'right' ? 'flex-row-reverse' : ''} ${
            logoPosition === 'bottom' ? 'flex-col-reverse' : ''
          }`}>
            
            {clientLogoUrl && (
              <img 
                src={clientLogoUrl} 
                alt="Logo" 
                style={{ height: `${logoHeight}px` }}
                className="w-auto max-w-xs object-contain"
                onError={(e) => e.currentTarget.style.display = 'none'}
              />
            )}
            
            {showName && (
              <CardTitle className="text-3xl text-primary">
                {clientBrandName}
              </CardTitle>
            )}
          </div>
        )}

        {/* Título e Descrição do Formulário */}
        {displayTitle && (
          <CardTitle className="text-2xl mt-2">{displayTitle}</CardTitle>
        )}
        {displayDescription && (
          <CardDescription className="text-base mt-2">
            {displayDescription}
          </CardDescription>
        )}
      </CardHeader>
    </Card>
  );
}
