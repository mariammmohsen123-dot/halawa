# Security Specification & Threat Model (HCC – Concept Ecosystem)

## 1. Data Invariants
1. **Unauthenticated Public Content**: Public visitors may read `site_settings`, `media`, `appointment_slots`, and only `status == 'published'` documents in `pages`, `services`, `projects`, `project_metrics`, `partners`, and `team_members`. Draft content must never be leaked to unauthenticated users.
2. **PII Isolation**: Client emails, names, and messages in `inquiries` and `appointments` are strictly non-readable to the public and non-staff users. Consultation availability is separated into `appointment_slots` (zero PII).
3. **Public Intake Integrity**: Public `create` on `inquiries` must enforce `status == 'new'`, `createdAt == request.time`, valid email format, strict key allowlists (`hasAll` + `hasOnly`), and field length caps. Public `create` on `appointments` must additionally verify `exists(/databases/$(database)/documents/appointment_slots/$(incoming().slotId))` and `status == 'pending'`.
4. **Role-Based Access Control (RBAC)**:
   - `admin`: Bootstrap owners (`mariammmohsen123@gmail.com`, `admin@admin.com` with `email_verified == true`) or active `users/{uid}` with `role == 'admin'`. Full CRUD across CMS, inquiries, appointments, `site_settings`, and `users`.
   - `editor`: Active `users/{uid}` with `role == 'editor'`. Can manage CMS collections (`pages`, `services`, `projects`, `project_metrics`, `partners`, `team_members`, `media`, `appointment_slots`) and update `inquiries`/`appointments` status/notes, but CANNOT modify `site_settings`, CANNOT read/write `users`, and CANNOT delete `inquiries` or `appointments`.
5. **Immutable Audit Logs**: `activity_logs` allows staff creation only when `actorUid == request.auth.uid` and `createdAt == request.time`. `update` and `delete` are permanently denied.
6. **Path Variable Hardening**: Every single-document `get`, `create`, `update`, `delete` enforces `isValidId(...)` (`^[a-zA-Z0-9_\-]+$`, max 128 chars).

## 2. "Dirty Dozen" Adversarial Payloads (Expected: PERMISSION_DENIED)
1. **Shadow Field Injection on Inquiry**: `{ fullName: "Test", organization: "Org", email: "a@b.com", serviceInterest: "ISO", message: "Hello world", language: "ar", status: "new", createdAt: serverTimestamp(), isAdmin: true }` -> Rejected by `keys().hasOnly(...)`.
2. **Status Escalation on Inquiry Create**: `{ ..., status: "completed" }` -> Rejected because public create mandates `status == 'new'`.
3. **Spoofed Timestamp on Inquiry Create**: `{ ..., createdAt: "2020-01-01T00:00:00Z" }` -> Rejected by `createdAt == request.time`.
4. **Orphaned Appointment Slot**: Creating an appointment with `slotId: "non_existent_slot_999"` -> Rejected by `exists(.../appointment_slots/...)`.
5. **PII Scraping on Inquiries**: Unauthenticated `list` or `get` on `/inquiries` or `/appointments` -> Rejected.
6. **Draft Content Leak**: Unauthenticated `get` on `/projects/draft_project_1` where `status == 'draft'` -> Rejected.
7. **Self-Assigned Admin Role**: Authenticated non-admin user attempting `setDoc(doc(db, 'users', uid), { role: 'admin', active: true, ... })` -> Rejected.
8. **Editor Privilege Escalation**: Active `editor` attempting to update `/site_settings/main` or `/users/{uid}` -> Rejected.
9. **Unverified Email Admin Spoof**: Token with `email: 'mariammmohsen123@gmail.com'` and `email_verified: false` -> Rejected.
10. **Path Traversal / Oversized ID Poisoning**: Creating `/services/..%2Fadmin` or a 300-character document ID -> Rejected by `isValidId()`.
11. **Media Payload Exhaustion**: Uploading a 2MB string into `media/{id}.url` -> Rejected by `.size() <= 450000`.
12. **Audit Log Tampering**: Even an `admin` attempting `update` or `delete` on `/activity_logs/{logId}` -> Rejected.
