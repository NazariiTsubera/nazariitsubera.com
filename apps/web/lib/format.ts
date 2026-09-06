/** "+12109806600" -> "(210) 980-6600". Anything that is not a US E.164 number is returned as is. */
export function formatPhone(e164: string) {
  const match = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(e164);
  return match ? `(${match[1]}) ${match[2]}-${match[3]}` : e164;
}
