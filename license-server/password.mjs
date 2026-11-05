import { passwordHash } from "./security.mjs";
// Pipe the password through stdin; it never appears in command arguments.
let password = "";
for await (const chunk of process.stdin) password += chunk;
password = password.replace(/\r?\n$/, "");
if (password.length < 16) throw new Error("Use an admin password with at least 16 characters");
console.log(passwordHash(password));
