import { useState } from "react";

export default function AdminUser({ item, action }) {
  const [form, setForm] = useState({
    name: item.name || "",
    email: item.email,
    preferredLanguage: item.preferredLanguage || "en",
    role: item.role,
  });
  
  return (
    <article className="admin-user">
      <div className="admin-user-fields">
        <input
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          aria-label="Name"
        />
        <input
          type="email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          aria-label="Email"
        />
        <select
          value={form.role}
          onChange={(event) => setForm({ ...form, role: event.target.value })}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div className="admin-actions">
        <span className={`status ${item.isSuspended ? "failed" : "sent"}`}>
          {item.isSuspended ? "Suspended" : "Active"}
        </span>
        <button onClick={() => action(`/admin/users/${item.id}`, form, "User updated.")}>
          Save
        </button>
        <button
          className={item.isSuspended ? "" : "danger"}
          onClick={() =>
            action(
              `/admin/users/${item.id}/suspension`,
              { isSuspended: !item.isSuspended },
              item.isSuspended ? "Account reactivated." : "Account suspended.",
            )
          }
        >
          {item.isSuspended ? "Reactivate" : "Suspend"}
        </button>
      </div>
    </article>
  );
}
