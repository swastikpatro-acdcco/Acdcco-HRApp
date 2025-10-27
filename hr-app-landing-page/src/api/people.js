import client from "./client";

export async function createPerson(payload) {
  const tcRaw = payload.time_commitment;
  const tc =
    tcRaw === "" || tcRaw === null || tcRaw === undefined
      ? null
      : Number.isFinite(parseInt(tcRaw, 10))
      ? parseInt(tcRaw, 10)
      : null;

  const body = {
    full_name: payload.name || "",
    position: payload.title || "",
    department: payload.department || "",
    status:
      payload.status === "On leave"
        ? "on_leave"
        : payload.status === "Employee"
        ? "active"
        : (payload.status || "inactive").toLowerCase(),
    start_date: payload.startDate || null,
    timezone: payload.location || null,
    acdc_email: payload.acdc_email || null,
    personal_email: payload.personal_email || null,
    phone: payload.phone || null,
    subteam: payload.subteam || null,
    time_commitment: tc, // <-- send it
  };

  const { data } = await client.post("/people/", body);
  return data;
}

export async function updatePerson(id, payload) {
  const { data } = await client.patch(`/people/${id}/`, payload);
  return data;
}

export async function deletePerson(id) {
  await client.delete(`/people/${id}/`);
}
