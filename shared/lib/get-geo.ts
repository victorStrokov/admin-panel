export async function getGeo(ip: string | null) {
  if (!ip || ip === '::1') return null;

  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`);
    if (!res.ok) return null;

    const data = await res.json();

    return {
      city: data.city,
      region: data.region,
      country: data.country_name,
    };
  } catch {
    return null;
  }
}
