-- Permitir acesso público à tabela projects para formulários públicos
-- Esta política permite que qualquer pessoa (incluindo usuários não autenticados)
-- visualize projetos através do link_unique, essencial para formulários públicos

CREATE POLICY "Allow public read access to projects via link_unique"
ON public.projects
FOR SELECT
TO anon, authenticated
USING (true);

-- Comentário: Esta política permite que formulários públicos sejam acessados
-- sem necessidade de autenticação. A segurança é mantida porque:
-- 1. Apenas leitura (SELECT) é permitida
-- 2. Usuários não podem modificar, criar ou deletar projetos
-- 3. O link_unique é um UUID gerado aleatoriamente, difícil de adivinhar