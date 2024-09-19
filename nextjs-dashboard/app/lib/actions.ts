"use server";

// Marca que todas las funciones que se exportan en este archivo son de
// servidor y por lo tanto no se ejecuta ni se envian al cliente

import { z } from "zod";
import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Validacion completa de los datos de Invoice
const CreateInvoiceSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(["pending", "paid"]),
  date: z.string(),
});

// Datos que se omitiran en la validación porque no estan en el formulario
const CreateInvoiceFormSchema = CreateInvoiceSchema.omit({
  id: true,
  date: true,
});

export async function createInvoice(formData: FormData) {
  console.log("createInvoice", formData);

  const { customerId, amount, status } = CreateInvoiceFormSchema.parse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  // Se transforma para evitar errores de redondeo
  const amountInCents = amount * 100;
  // Se crea la fecha actual en formato 2023-11-25, solo la fecha, no la hora,
  // si se quiere la hora, en vez de date se pone time
  const [date] = new Date().toISOString().split("T");

  console.log({
    customerId,
    amountInCents,
    status,
    date,
  });

  // Antes de ejecutarlo se limpia y sanitiza para evitar inyecciones SQL y ataques
  await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;

    // Se revalidan los datos en este path (Vuelve a cargar la lista con el nuevo invoice)
    revalidatePath('/dashboard/invoices')
    // Se redirecciona al path dashboard/invoices luego de agregar el nuevo invoice
    redirect('/dashboard/invoices')
}
