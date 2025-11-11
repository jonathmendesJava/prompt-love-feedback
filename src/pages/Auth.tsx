import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";


export default function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Conta criada com sucesso!");
      navigate("/dashboard");
    }
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
    } else {
      navigate("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0f0f23]">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Main Container */}
      <div className="relative w-full max-w-6xl h-[600px] flex items-center justify-center">
        {/* Glass Container */}
        <div className="relative w-full max-w-5xl h-full backdrop-blur-xl bg-white/5 rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          
          <div className="relative h-full flex">
            {/* Left Side - Info Panel with Slide Animation */}
            <div 
              className={`absolute top-0 left-0 w-1/2 h-full p-12 flex flex-col justify-between transition-all duration-700 ease-in-out ${
                isSignUp ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'
              }`}
            >
              <div>
                <div className="mb-8">
                  <h1 className="text-4xl font-bold text-white">FiOS | CTA</h1>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Sistema de Avaliação
                </h2>
                <p className="text-white/70 text-lg leading-relaxed">
                  Gerencie suas avaliações de atendimento de forma simples e eficiente. 
                  Crie formulários personalizados e colete feedback valioso dos seus clientes.
                </p>
              </div>
              <div className="text-white/50 text-sm">
                www.fios-cta.com
              </div>
            </div>

            {/* Right Side - Info Panel for Sign Up with Slide Animation */}
            <div 
              className={`absolute top-0 right-0 w-1/2 h-full p-12 flex flex-col justify-between transition-all duration-700 ease-in-out ${
                isSignUp ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
              }`}
            >
              <div>
                <div className="mb-8">
                  <h1 className="text-4xl font-bold text-white">FiOS | CTA</h1>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Bem-vindo!
                </h2>
                <p className="text-white/70 text-lg leading-relaxed">
                  Crie sua conta e comece a transformar a experiência de atendimento 
                  dos seus clientes com nosso sistema inteligente de avaliações.
                </p>
              </div>
              <div className="text-white/50 text-sm">
                www.fios-cta.com
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-3/4 bg-gradient-to-b from-transparent via-white/20 to-transparent" />

            {/* Right Side - Login Form with Slide Animation */}
            <div 
              className={`absolute top-0 right-0 w-1/2 h-full p-12 flex flex-col justify-center transition-all duration-700 ease-in-out ${
                isSignUp ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
              }`}
            >
              <div className="max-w-sm mx-auto w-full">
                <h3 className="text-3xl font-bold text-white mb-8">Login</h3>
                <form onSubmit={handleSignIn} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-white/90">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 backdrop-blur-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-white/90">Senha</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 backdrop-blur-sm"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 rounded-xl" 
                    disabled={loading}
                  >
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setIsSignUp(true)}
                      className="text-white/70 hover:text-white transition-colors text-sm"
                    >
                      Não tem conta? <span className="text-primary font-semibold">Cadastre-se</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Left Side - Sign Up Form with Slide Animation */}
            <div 
              className={`absolute top-0 left-0 w-1/2 h-full p-12 flex flex-col justify-center transition-all duration-700 ease-in-out ${
                isSignUp ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
              }`}
            >
              <div className="max-w-sm mx-auto w-full">
                <h3 className="text-3xl font-bold text-white mb-8">Cadastro</h3>
                <form onSubmit={handleSignUp} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-white/90">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 backdrop-blur-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-white/90">Senha</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 backdrop-blur-sm"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 rounded-xl" 
                    disabled={loading}
                  >
                    {loading ? "Cadastrando..." : "Cadastrar"}
                  </Button>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setIsSignUp(false)}
                      className="text-white/70 hover:text-white transition-colors text-sm"
                    >
                      Já tem conta? <span className="text-primary font-semibold">Faça login</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
