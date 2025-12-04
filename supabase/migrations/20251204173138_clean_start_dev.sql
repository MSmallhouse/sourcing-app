
  create table "public"."admins" (
    "user_id" uuid not null
      );


alter table "public"."admins" enable row level security;


  create table "public"."leads" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default now(),
    "sourcer_id" uuid not null,
    "title" text not null,
    "purchase_price" numeric,
    "notes" text,
    "calendar_event_id" text,
    "status" text not null default 'submitted'::text,
    "pickup_start" timestamp with time zone,
    "pickup_end" timestamp with time zone,
    "sale_date" date,
    "sale_price" numeric,
    "rejection_reason" text,
    "image_url" text,
    "address" text,
    "phone" text,
    "commission_amount" numeric,
    "commission_paid" boolean not null default false
      );


alter table "public"."leads" enable row level security;


  create table "public"."profiles" (
    "id" uuid not null,
    "email" text,
    "first_name" text,
    "last_name" text,
    "stripe_account_id" text,
    "sourcer_phone" text default ''::text,
    "role" text
      );


alter table "public"."profiles" enable row level security;

CREATE UNIQUE INDEX admins_pkey ON public.admins USING btree (user_id);

CREATE UNIQUE INDEX leads_pkey ON public.leads USING btree (id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

alter table "public"."admins" add constraint "admins_pkey" PRIMARY KEY using index "admins_pkey";

alter table "public"."leads" add constraint "leads_pkey" PRIMARY KEY using index "leads_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."admins" add constraint "admins_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."admins" validate constraint "admins_user_id_fkey";

alter table "public"."leads" add constraint "leads_sourcer_id_fkey" FOREIGN KEY (sourcer_id) REFERENCES public.profiles(id) not valid;

alter table "public"."leads" validate constraint "leads_sourcer_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'sourcer');
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.prevent_role_change()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  if new.role <> old.role then
    raise exception 'You cannot change your role';
  end if;
  return new;
end;
$function$
;

grant delete on table "public"."admins" to "anon";

grant insert on table "public"."admins" to "anon";

grant references on table "public"."admins" to "anon";

grant select on table "public"."admins" to "anon";

grant trigger on table "public"."admins" to "anon";

grant truncate on table "public"."admins" to "anon";

grant update on table "public"."admins" to "anon";

grant delete on table "public"."admins" to "authenticated";

grant insert on table "public"."admins" to "authenticated";

grant references on table "public"."admins" to "authenticated";

grant select on table "public"."admins" to "authenticated";

grant trigger on table "public"."admins" to "authenticated";

grant truncate on table "public"."admins" to "authenticated";

grant update on table "public"."admins" to "authenticated";

grant delete on table "public"."admins" to "service_role";

grant insert on table "public"."admins" to "service_role";

grant references on table "public"."admins" to "service_role";

grant select on table "public"."admins" to "service_role";

grant trigger on table "public"."admins" to "service_role";

grant truncate on table "public"."admins" to "service_role";

grant update on table "public"."admins" to "service_role";

grant delete on table "public"."leads" to "anon";

grant insert on table "public"."leads" to "anon";

grant references on table "public"."leads" to "anon";

grant select on table "public"."leads" to "anon";

grant trigger on table "public"."leads" to "anon";

grant truncate on table "public"."leads" to "anon";

grant update on table "public"."leads" to "anon";

grant delete on table "public"."leads" to "authenticated";

grant insert on table "public"."leads" to "authenticated";

grant references on table "public"."leads" to "authenticated";

grant select on table "public"."leads" to "authenticated";

grant trigger on table "public"."leads" to "authenticated";

grant truncate on table "public"."leads" to "authenticated";

grant update on table "public"."leads" to "authenticated";

grant delete on table "public"."leads" to "service_role";

grant insert on table "public"."leads" to "service_role";

grant references on table "public"."leads" to "service_role";

grant select on table "public"."leads" to "service_role";

grant trigger on table "public"."leads" to "service_role";

grant truncate on table "public"."leads" to "service_role";

grant update on table "public"."leads" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";


  create policy "Allow all authenticated users to read admins"
  on "public"."admins"
  as permissive
  for select
  to public
using ((auth.role() = 'authenticated'::text));



  create policy "Allow user to check own admin status"
  on "public"."admins"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Users can insert their own leads"
  on "public"."leads"
  as permissive
  for insert
  to public
with check ((auth.uid() = sourcer_id));



  create policy "Users can select their own leads"
  on "public"."leads"
  as permissive
  for select
  to public
using ((auth.uid() = sourcer_id));



  create policy "allow all for debug"
  on "public"."leads"
  as permissive
  for all
  to public
using (true)
with check (true);



  create policy "Allow self or admin (via admins table) to read profiles"
  on "public"."profiles"
  as permissive
  for select
  to public
using (((auth.uid() = id) OR (EXISTS ( SELECT 1
   FROM public.admins
  WHERE (admins.user_id = auth.uid())))));



  create policy "Allow users to insert their own profile"
  on "public"."profiles"
  as permissive
  for insert
  to public
with check ((auth.uid() = id));



  create policy "Allow users to update their own profile"
  on "public"."profiles"
  as permissive
  for update
  to public
using ((auth.uid() = id));


CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


  create policy "Allow image CRUD for all users 1x4w2rt_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((auth.role() = 'authenticated'::text));



  create policy "Allow image CRUD for all users 1x4w2rt_1"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check ((auth.role() = 'authenticated'::text));



  create policy "Allow image CRUD for all users 1x4w2rt_2"
  on "storage"."objects"
  as permissive
  for delete
  to public
using ((auth.role() = 'authenticated'::text));



  create policy "Allow image CRUD for all users 1x4w2rt_3"
  on "storage"."objects"
  as permissive
  for update
  to public
using ((auth.role() = 'authenticated'::text));



