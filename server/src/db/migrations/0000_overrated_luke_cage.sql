CREATE TABLE "usuarios" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "nome_completo" text NOT NULL,
  "email" text NOT NULL,
  "telefone" text NOT NULL,
  "senha" text NOT NULL,
  "data_nascimento" date NOT NULL,
  "observacoes" text,
  "criado_em" timestamp DEFAULT now() NOT NULL,
  "atualizado_em" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "usuarios_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "agendamentos" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "usuario_id" uuid NOT NULL,
  "nome_barbeiro" text NOT NULL,
  "nome_servico" text NOT NULL,
  "data" date NOT NULL,
  "horario" time NOT NULL,
  "status" text DEFAULT 'pendente' NOT NULL,
  "observacoes" text,
  "criado_em" timestamp DEFAULT now() NOT NULL,
  "atualizado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;