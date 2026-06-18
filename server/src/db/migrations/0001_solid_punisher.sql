CREATE TABLE "barbeiros" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "nome_completo" text NOT NULL,
  "especialidade" text NOT NULL,
  "avaliacao" real DEFAULT 5 NOT NULL,
  "anos_experiencia" integer DEFAULT 0 NOT NULL,
  "numero_clientes" integer DEFAULT 0 NOT NULL,
  "foto" text,
  "ativo" boolean DEFAULT true NOT NULL,
  "criado_em" timestamp DEFAULT now() NOT NULL,
  "atualizado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "servicos" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "nome" text NOT NULL,
  "descricao" text NOT NULL,
  "preco" real NOT NULL,
  "duracao" integer NOT NULL,
  "icone" text DEFAULT 'fa-cut' NOT NULL,
  "itens_incluidos" text[] DEFAULT '{}' NOT NULL,
  "ativo" boolean DEFAULT true NOT NULL,
  "criado_em" timestamp DEFAULT now() NOT NULL,
  "atualizado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "barbeiro_servicos" (
  "barbeiro_id" uuid NOT NULL,
  "servico_id" uuid NOT NULL,
  "criado_em" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "barbeiro_servicos_barbeiro_id_servico_id_pk" PRIMARY KEY("barbeiro_id","servico_id")
);
--> statement-breakpoint
CREATE TABLE "horarios_trabalho" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "barbeiro_id" uuid NOT NULL,
  "dia_semana" integer NOT NULL,
  "horario_inicio" time NOT NULL,
  "horario_fim" time NOT NULL,
  "criado_em" timestamp DEFAULT now() NOT NULL,
  "atualizado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "horarios_bloqueados" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "nome_barbeiro" text NOT NULL,
  "data" date NOT NULL,
  "horario" time NOT NULL,
  "motivo" text,
  "criado_em" timestamp DEFAULT now() NOT NULL,
  "atualizado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "barbeiro_servicos" ADD CONSTRAINT "barbeiro_servicos_barbeiro_id_barbeiros_id_fk" FOREIGN KEY ("barbeiro_id") REFERENCES "public"."barbeiros"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "barbeiro_servicos" ADD CONSTRAINT "barbeiro_servicos_servico_id_servicos_id_fk" FOREIGN KEY ("servico_id") REFERENCES "public"."servicos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "horarios_trabalho" ADD CONSTRAINT "horarios_trabalho_barbeiro_id_barbeiros_id_fk" FOREIGN KEY ("barbeiro_id") REFERENCES "public"."barbeiros"("id") ON DELETE cascade ON UPDATE no action;