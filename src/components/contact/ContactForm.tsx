"use client";

import { useState } from "react";
import { contactEmail, siteName } from "@/config/site";
import styles from "@/components/contact/contact.module.css";

export default function ContactForm() {
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${contactEmail}`, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        setStatus("error");
        return;
      }

      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className={styles.success} role="status" aria-live="polite">
        Thanks for the note. The message has been handed off and we will reply
        from {contactEmail}.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={styles.form}
      aria-busy={status === "submitting"}
    >
      <input type="text" name="_honey" style={{ display: "none" }} />
      <input type="hidden" name="_captcha" value="false" />
      <input type="hidden" name="_subject" value={`${siteName} - New contact`} />

      <div className={styles.fieldGroup}>
        <label htmlFor="email" className={styles.label}>
          Email
        </label>
        <input
          id="email"
          type="email"
          name="email"
          required
          autoComplete="email"
          className={styles.input}
          placeholder="you@example.com"
        />
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="message" className={styles.label}>
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={7}
          className={`${styles.input} ${styles.textarea}`}
          placeholder="Tell me what you want to explore, compare, or extend."
        />
      </div>

      {status === "error" ? (
        <p className={styles.error} role="alert" aria-live="assertive">
          The form could not be sent. Please retry or email directly.
        </p>
      ) : null}

      <button type="submit" disabled={status === "submitting"} className={styles.button}>
        {status === "submitting" ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
