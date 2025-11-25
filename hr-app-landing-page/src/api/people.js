import client from "./client";

export async function createPerson(payload) {
  // normalize time_commitment to a number or null
  const tcRaw = payload.time_commitment;
  const timeCommitment =
    tcRaw === "" || tcRaw === undefined || tcRaw === null
      ? null
      : Number.parseInt(tcRaw, 10);

  const body = {
    full_name: payload.name || "",
    // position can come from your select as "position" or from older code as "title"
    position: payload.position || payload.title || "",
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

    // new fields
    time_commitment: timeCommitment,
    reports_to: payload.reports_to || "",
  };

  const { data } = await client.post("/people/", body);
  return data; // returns the created Person from backend
}

export async function updatePerson(id, payload) {
  const { data } = await client.patch(`/people/${id}/`, payload);
  return data;
}

export async function deletePerson(id) {
  await client.delete(`/people/${id}/`);
}

// 👇 NEW: get only "Human Resources" people (for the Register page)
export async function fetchHRPeople() {
  const { data } = await client.get("/people/human_resources/");
  return data;
}

// 👇 NEW: set portal account info for a specific person
export async function setPortalAccount(id, payload) {
  const { data } = await client.patch(
    `/people/${id}/set_portal_account/`,
    payload
  );
  return data;
}
