import ContactForm from "@/components/contact/ContactForm";
import styles from "@/components/contact/contact.module.css";
import {
  contactEmail,
  secondaryAttribution,
  siteDescription,
  siteName,
} from "@/config/site";

export default function Contact() {
  return (
    <div className={styles.contactShell}>
      <div className={styles.container}>
        <div className={styles.intro}>
          <p className={`${styles.eyebrow} ${styles.marker}`}>Contact</p>
          <h1 className={styles.heading}>Continue from the public directory.</h1>
          <p className={styles.lede}>
            Use the form for feedback, custom brief requests, partnership questions,
            or a narrower research ask.
          </p>
        </div>

        <div className={styles.grid}>
          <div className={styles.panel}>
            <p className={styles.eyebrow}>Send a message</p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>

          <div className={styles.stack}>
            <div className={styles.panel}>
              <p className={styles.eyebrow}>Direct channel</p>

              <div className={styles.detailRule}>
                <p className={styles.meta}>Email</p>
                <a href={`mailto:${contactEmail}`} className={styles.link}>
                  {contactEmail}
                </a>
              </div>

              <div className={styles.detailRule}>
                <p className={styles.meta}>LinkedIn</p>
                <a
                  href="https://linkedin.com/in/kondratevakate"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  Kate Kondrateva
                </a>
              </div>

              <div className={styles.detailRule}>
                <p className={styles.meta}>Publisher</p>
                <a
                  href={secondaryAttribution.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  {secondaryAttribution.name}
                </a>
              </div>
            </div>

            <div className={styles.panelSoft}>
              <p className={styles.body}>
                {siteName} is a research project published by {secondaryAttribution.name}.
                The current public release stays intentionally lightweight: maps first,
                narrative context second, and operational complexity kept low.
              </p>
              <p className={`${styles.body} mt-4`}>{siteDescription}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
